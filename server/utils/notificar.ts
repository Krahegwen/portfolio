import type { H3Event } from 'h3'

/**
 * El único sitio del proyecto que emite un aviso, y el único que construye una
 * URL de Telegram.
 *
 * Sale por Telegram y no por correo porque el envío de correo desde un Worker
 * exige plan Workers Paid, y esto es una web personal. A cambio, el aviso llega
 * al móvil al instante y no hace falta dar de alta ningún proveedor nuevo.
 *
 * Dos detalles copiados de `common/telegram_out.py` de TWS-Tools, que ya se
 * ganaron su sitio en producción:
 *
 *   · **Reintento en plano ante un 400.** Telegram responde 400 cuando no sabe
 *     interpretar el marcado, y el cuerpo lo escribe un desconocido en un
 *     formulario público: antes que perder el aviso, se manda sin formato.
 *   · **El token nunca se registra.** Va dentro de la URL, así que cualquier
 *     traza que la incluya lo filtra. Todo lo que sale por consola pasa por
 *     `redactar()`.
 *
 * Cambiar de transporte es reescribir `enviar()`. Ni las rutas de la API ni el
 * formulario saben por dónde sale esto.
 */

export type TipoAviso = 'contacto' | 'descarga-cv'

export class SinTransporte extends Error {
  constructor(motivo: string) {
    super(`No hay transporte de avisos: ${motivo}`)
    this.name = 'SinTransporte'
  }
}

interface Aviso {
  tipo: TipoAviso
  titulo: string
  /** Pares etiqueta/valor que forman el cuerpo. El orden se respeta. */
  campos: Array<[string, string]>
}

/** Telegram corta en 4096; el margen deja sitio al título y las etiquetas. */
const LIMITE = 3900

/** Los tres caracteres que Telegram exige escapar en modo HTML. */
function escapar(texto: string) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Quita el token de cualquier cadena antes de que llegue a un log. */
function redactar(texto: string) {
  return texto.replace(/bot\d+:[\w-]+/g, 'bot<token>')
}

function recortar(texto: string, maximo: number) {
  return texto.length <= maximo ? texto : `${texto.slice(0, maximo - 1)}…`
}

/**
 * Los secretos de Cloudflare viajan en el contexto del evento, no en
 * `process.env`. En local sí caen a `process.env` desde el `.env`.
 */
function config(event: H3Event) {
  const env = (event.context as { cloudflare?: { env?: Record<string, unknown> } })
    .cloudflare?.env

  const leer = (clave: string) =>
    (env?.[clave] ?? process.env[clave]) as string | undefined

  return { token: leer('TELEGRAM_TOKEN'), chat: leer('TELEGRAM_CHAT_ID') }
}

async function enviar(token: string, cuerpo: Record<string, string>) {
  const respuesta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    const error = new Error(`Telegram ${respuesta.status}: ${redactar(detalle).slice(0, 300)}`)
    return { ok: false as const, estado: respuesta.status, error }
  }

  return { ok: true as const }
}

export async function notificar(event: H3Event, aviso: Aviso) {
  const { token, chat } = config(event)

  if (!token) throw new SinTransporte('falta el secreto TELEGRAM_TOKEN')
  if (!chat) throw new SinTransporte('falta el secreto TELEGRAM_CHAT_ID')

  const plano = [
    aviso.titulo,
    '',
    ...aviso.campos.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
  ].join('\n')

  const html = [
    `<b>${escapar(aviso.titulo)}</b>`,
    '',
    ...aviso.campos.map(([etiqueta, valor]) => `<b>${escapar(etiqueta)}:</b> ${escapar(valor)}`),
  ].join('\n')

  const base = { chat_id: chat, link_preview_options: JSON.stringify({ is_disabled: true }) }

  const conFormato = await enviar(token, {
    ...base,
    text: recortar(html, LIMITE),
    parse_mode: 'HTML',
  })
  if (conFormato.ok) return

  // 400 es "no sé leer este marcado". Cualquier otro código es un problema de
  // verdad —token mal, chat inexistente, Telegram caído— y reintentar en plano
  // solo lo escondería.
  if (conFormato.estado !== 400) throw conFormato.error

  console.warn('[avisos] Telegram rechazó el formato, reintento en plano:', redactar(String(conFormato.error)))

  const enPlano = await enviar(token, { ...base, text: recortar(plano, LIMITE) })
  if (!enPlano.ok) throw enPlano.error
}
