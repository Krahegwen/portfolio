import { createHash } from 'node:crypto'
import { claveConfigurada, claveCorrecta, emitirPase } from '../../utils/pase'

/**
 * Desbloqueo de las versiones no públicas del CV.
 *
 * Lo abre el huevo de pascua de `/cv`: diez clics en el epígrafe «Currículum»
 * sacan un modal que pide contraseña, y esa contraseña se contrasta **aquí**, no
 * en el navegador. Una comprobación en cliente estaría escrita en el bundle, que
 * es público, y no sería una comprobación sino un adorno.
 *
 * La contraseña vive en el secreto `CV_CLAVE`:
 *
 *   npx wrangler secret put CV_CLAVE
 *
 * Sin él la ruta responde 503 y el modal lo dice: es preferible a fingir que la
 * clave es incorrecta cuando lo que falta es la configuración.
 */

/** Dos intentos cada media hora. */
const MAX_INTENTOS = 2
const VENTANA_MS = 30 * 60 * 1000

/**
 * Contador en memoria, igual que el del formulario. En serverless cada instancia
 * tiene el suyo, así que **no es un límite duro**: frena la ráfaga desde una
 * misma conexión, no un ataque repartido. Quien se lo tome en serio necesita KV
 * o un Durable Object; para lo que protege esto —un CV— la defensa que importa
 * es que la clave sea larga.
 */
const intentos = new Map<string, number[]>()

/** La IP no se guarda: solo su huella, y solo mientras dura la ventana. */
function huella(ip: string) {
  return createHash('sha256').update(`kw-cv:${ip}`).digest('hex').slice(0, 16)
}

function demasiados(ip: string, ahora: number) {
  const clave = huella(ip)
  const recientes = (intentos.get(clave) ?? []).filter(t => ahora - t < VENTANA_MS)
  recientes.push(ahora)
  intentos.set(clave, recientes)

  // Barrido perezoso: sin esto el mapa crece durante toda la vida de la instancia.
  if (intentos.size > 500) {
    for (const [k, v] of intentos) {
      if (v.every(t => ahora - t >= VENTANA_MS)) intentos.delete(k)
    }
  }

  return recientes.length > MAX_INTENTOS
}

export default defineEventHandler(async (event) => {
  const cuerpo = await readBody<{ clave?: unknown }>(event).catch(() => null)

  const secreto = claveConfigurada(event)
  if (!secreto) {
    throw createError({ statusCode: 503, statusMessage: 'sin-clave' })
  }

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    ?? getRequestIP(event)
    ?? 'desconocida'

  // El recuento va **antes** de comprobar nada: un limitador que solo cuenta los
  // fallos que llegan a comparar no limita, porque el coste de probar sigue
  // siendo el mismo. Cuenta también el acierto, que es lo que dice el nombre.
  if (demasiados(ip, Date.now())) {
    throw createError({ statusCode: 429, statusMessage: 'demasiados-intentos' })
  }

  /*
   * Medio segundo de espera en cada intento. No consume CPU —el Worker está
   * parado, no calculando— y convierte cualquier fuerza bruta en algo que se
   * mide en años. Es la única defensa de las dos que no depende de que el
   * atacante caiga siempre en la misma instancia.
   */
  await new Promise(resolve => setTimeout(resolve, 500))

  if (!claveCorrecta(secreto, cuerpo?.clave)) {
    throw createError({ statusCode: 401, statusMessage: 'clave-incorrecta' })
  }

  return { ok: true, caduca: emitirPase(event, secreto) }
})
