import { createHash } from 'node:crypto'
import { SinTransporte, notificar } from '../utils/notificar'

/**
 * Formulario de contacto.
 *
 * Sin CAPTCHA a propósito: un buzón personal no recibe el volumen que justifica
 * poner un muro delante de cada persona que quiere escribir. Tres filtros baratos
 * paran el spam automatizado —campo trampa, tiempo mínimo de relleno y un límite
 * por IP— y si algún día dejan de bastar, el siguiente paso está anotado en
 * DESPLIEGUE.md (Turnstile, que el dominio ya está en Cloudflare).
 */

interface Cuerpo {
  nombre?: string
  email?: string
  mensaje?: string
  consentimiento?: boolean
  /** En qué idioma escribió, para saber en cuál contestar. */
  idioma?: string
  /** Campo trampa: invisible para una persona, irresistible para un bot. */
  empresa?: string
  /** Marca de cuándo se pintó el formulario, para medir el tiempo de relleno. */
  abierto?: number
}

const LIMITES = {
  nombre: [2, 80],
  email: [5, 120],
  mensaje: [10, 4000],
} as const

/** Un formulario sincero tarda más que esto en rellenarse. */
const SEGUNDOS_MINIMOS = 3
/** Y menos que esto: pasadas dos horas, la marca es de otra sesión o inventada. */
const SEGUNDOS_MAXIMOS = 2 * 60 * 60

const MAX_POR_VENTANA = 3
const VENTANA_MS = 10 * 60 * 1000

/**
 * Contador en memoria. En serverless cada instancia tiene el suyo, así que esto
 * no es un límite duro: es un freno que corta la ráfaga desde una misma IP sin
 * montar un Redis para un formulario que recibe un mensaje a la semana.
 */
const golpes = new Map<string, number[]>()

/** La IP no se guarda: solo su huella, y solo mientras dura la ventana. */
function huella(ip: string) {
  return createHash('sha256').update(`kw:${ip}`).digest('hex').slice(0, 16)
}

function demasiados(ip: string, ahora: number) {
  const clave = huella(ip)
  const recientes = (golpes.get(clave) ?? []).filter(t => ahora - t < VENTANA_MS)
  recientes.push(ahora)
  golpes.set(clave, recientes)

  // Barrido perezoso: sin esto el mapa crece durante toda la vida de la instancia.
  if (golpes.size > 500) {
    for (const [k, v] of golpes) {
      if (v.every(t => ahora - t >= VENTANA_MS)) golpes.delete(k)
    }
  }

  return recientes.length > MAX_POR_VENTANA
}

function texto(valor: unknown, [min, max]: readonly [number, number]) {
  if (typeof valor !== 'string') return null
  const limpio = valor.trim()
  return limpio.length >= min && limpio.length <= max ? limpio : null
}

/**
 * Deliberadamente laxa. Validar direcciones de correo con precisión es un
 * problema sin solución bonita, y rechazar una dirección legítima por un
 * carácter raro cuesta más que aceptar una falsa: la que responde es la persona.
 */
const FORMA_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export default defineEventHandler(async (event) => {
  const cuerpo = await readBody<Cuerpo>(event)
  const ahora = Date.now()

  // El campo trampa relleno es un bot. Se le responde 200 a propósito: un 400
  // le dice qué ha fallado y le invita a reintentarlo sin el campo.
  if (cuerpo?.empresa) return { ok: true }

  const abierto = Number(cuerpo?.abierto)
  const segundos = Number.isFinite(abierto) ? (ahora - abierto) / 1000 : -1
  if (segundos < SEGUNDOS_MINIMOS || segundos > SEGUNDOS_MAXIMOS) {
    throw createError({ statusCode: 400, statusMessage: 'formulario-caducado' })
  }

  if (cuerpo?.consentimiento !== true) {
    throw createError({ statusCode: 400, statusMessage: 'falta-consentimiento' })
  }

  const nombre = texto(cuerpo?.nombre, LIMITES.nombre)
  const email = texto(cuerpo?.email, LIMITES.email)
  const mensaje = texto(cuerpo?.mensaje, LIMITES.mensaje)

  if (!nombre || !email || !mensaje || !FORMA_EMAIL.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'datos-invalidos' })
  }

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    ?? getRequestIP(event)
    ?? 'desconocida'

  if (demasiados(ip, ahora)) {
    throw createError({ statusCode: 429, statusMessage: 'demasiados-envios' })
  }

  const idioma = cuerpo?.idioma === 'en' ? 'en' : 'es'

  try {
    await notificar(event, {
      tipo: 'contacto',
      asunto: `krahegwen.com — ${nombre}`,
      // El `replyTo` es la gracia de mandarlo por correo: responder es darle a
      // "Responder", sin copiar direcciones a mano desde un panel.
      responderA: email,
      campos: [
        ['De', `${nombre} <${email}>`],
        ['Idioma', idioma === 'es' ? 'Español' : 'Inglés'],
        ['Mensaje', mensaje],
        ['Recibido', new Date(ahora).toISOString()],
      ],
    })
  }
  catch (error) {
    /*
     * Si el correo no sale, **no** se responde `ok`. Decirle a alguien que su
     * mensaje ha llegado cuando se ha perdido es peor que darle un error: con
     * el error, el formulario le enseña la dirección para escribir directamente.
     */
    console.error('[contacto] el aviso no salió:', error)
    throw createError({
      statusCode: 503,
      statusMessage: error instanceof SinTransporte ? 'sin-transporte' : 'envio-fallido',
    })
  }

  return { ok: true }
})
