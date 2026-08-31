import type { H3Event } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * El pase que abre las versiones no públicas del CV.
 *
 * Contexto: `/cv` ofrece **un** CV, el público. Las otras dos versiones —la
 * anónima y la interna de Accenture— siguen ahí, pero detrás de una contraseña,
 * porque ofrecer las tres a cualquiera que pase quedaba raro y porque la interna
 * nombra clientes. El desbloqueo lo emite `server/api/cv/desbloquear.post.ts` y
 * lo exigen la descarga de esos PDF y sus hojas de impresión.
 *
 * **Es una cookie, y es la única de toda la web.** Se documenta en /privacidad y
 * hay un test que vigila que no aparezca ninguna más. Justificación de que no
 * pide consentimiento: es estrictamente necesaria para una función que solicita
 * de forma expresa quien la usa —yo, escribiendo una contraseña— y no sirve para
 * nada más. No mide, no perfila y no viaja a ningún tercero.
 *
 * Qué lleva dentro: la fecha de caducidad y su firma. Nada más. Ni quién, ni
 * desde dónde. No hay sesión que guardar en ningún sitio porque no hay nada que
 * recordar de quien entra: o la firma cuadra, o no.
 */

export const COOKIE_PASE = 'cv_pase'

/**
 * Treinta días.
 *
 * El pase no da acceso a nada que se pueda romper —dos PDF míos y sus hojas de
 * impresión—, así que hacerlo caducar cada jornada solo conseguía que hubiera que
 * teclear la contraseña más veces, y una contraseña que se teclea a diario acaba
 * pegada en algún sitio. Renovar la ventana es barato y la puerta sigue cerrada
 * para quien no la ha pasado nunca.
 *
 * Para cerrar de golpe todos los pases abiertos, sin esperar: cambiar `CV_CLAVE`.
 * La firma se deriva del secreto, así que rotarlo los invalida todos a la vez.
 * Para cerrar solo el de este navegador está el botón «Cerrar» de la página.
 */
export const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Los secretos de Cloudflare viajan en el contexto del evento, no en
 * `process.env`. En local sí caen a `process.env` desde el `.env`. Mismo
 * mecanismo que `notificar.ts`.
 */
export function claveConfigurada(event: H3Event): string | undefined {
  const env = (event.context as { cloudflare?: { env?: Record<string, unknown> } })
    .cloudflare?.env

  const valor = (env?.CV_CLAVE ?? process.env.CV_CLAVE) as string | undefined
  return valor && valor.length > 0 ? valor : undefined
}

/**
 * La firma no se calcula con la contraseña, sino con una derivación suya. Si
 * alguna vez la cookie se filtrase en un log, lo que se filtra es un HMAC de una
 * fecha, no material del que se pueda tirar para adivinar la clave.
 */
export function firmarPase(secreto: string, caduca: number) {
  return createHmac('sha256', `kw-cv-pase|${secreto}`)
    .update(String(caduca))
    .digest('base64url')
    .slice(0, 32)
}

/**
 * Comparación en tiempo constante. Sobre digests de longitud fija a propósito:
 * `timingSafeEqual` revienta si los búferes miden distinto, y la longitud de lo
 * que teclea quien lo intente no tiene por qué decidir si hay error o rechazo.
 */
function iguales(a: string, b: string) {
  const ha = createHmac('sha256', 'kw-cmp').update(a).digest()
  const hb = createHmac('sha256', 'kw-cmp').update(b).digest()
  return timingSafeEqual(ha, hb)
}

/** ¿La contraseña que llega es la buena? */
export function claveCorrecta(secreto: string, intento: unknown) {
  return typeof intento === 'string' && intento.length > 0 && iguales(intento, secreto)
}

/** Escribe la cookie. Devuelve cuándo caduca, para que la página lo sepa. */
export function emitirPase(event: H3Event, secreto: string) {
  const caduca = Date.now() + VIGENCIA_MS

  setCookie(event, COOKIE_PASE, `${caduca}.${firmarPase(secreto, caduca)}`, {
    httpOnly: true,
    // En local se sirve por http y una cookie `Secure` no se guardaría.
    secure: getRequestProtocol(event) === 'https',
    // `lax` basta: la descarga es una navegación del propio sitio, y así la
    // cookie no viaja en peticiones que origine una página ajena.
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(VIGENCIA_MS / 1000),
  })

  return caduca
}

/** Borra la cookie. */
export function anularPase(event: H3Event) {
  deleteCookie(event, COOKIE_PASE, { path: '/' })
}

/**
 * ¿Trae pase válido? Es la única pregunta que se hacen la descarga privada y el
 * middleware de las hojas de impresión.
 */
export function tienePase(event: H3Event) {
  const secreto = claveConfigurada(event)
  if (!secreto) return false

  const cookie = getCookie(event, COOKIE_PASE)
  if (!cookie) return false

  const [marca, firma] = cookie.split('.')
  const caduca = Number(marca)

  if (!firma || !Number.isFinite(caduca) || caduca <= Date.now()) return false

  return iguales(firma, firmarPase(secreto, caduca))
}
