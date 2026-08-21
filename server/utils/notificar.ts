import type { H3Event } from 'h3'

/**
 * El único sitio del proyecto que emite un aviso.
 *
 * Sale por correo, con el binding nativo de Cloudflare Email Sending: no hay
 * clave de API que custodiar ni proveedor externo que dar de alta, y el aviso
 * llega a la bandeja de siempre en lugar de a un panel al que hay que entrar.
 *
 * En los mensajes de contacto el `replyTo` es la dirección de quien escribe, así
 * que responder es darle a "Responder" y ya está.
 *
 * Cambiar de transporte —Telegram, un webhook, lo que sea— es reescribir
 * `enviar()`. Ni las rutas de la API ni el formulario saben por dónde sale esto.
 */

export type TipoAviso = 'contacto' | 'descarga-cv'

/** Lo que Cloudflare inyecta cuando el binding `send_email` está declarado. */
interface BindingEmail {
  send: (mensaje: {
    to: string
    from: { email: string, name?: string }
    replyTo?: string
    subject: string
    text: string
    html?: string
  }) => Promise<unknown>
}

export class SinTransporte extends Error {
  constructor(motivo: string) {
    super(`No hay transporte de avisos: ${motivo}`)
    this.name = 'SinTransporte'
  }
}

interface Aviso {
  tipo: TipoAviso
  asunto: string
  /** Pares etiqueta/valor que forman el cuerpo. El orden se respeta. */
  campos: Array<[string, string]>
  /** Solo para contacto: a quién contesta el botón de responder. */
  responderA?: string
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Los bindings de Cloudflare viajan en el contexto del evento, no en
 * `process.env`: son objetos vivos por petición, no cadenas de configuración.
 */
function bindings(event: H3Event) {
  return (event.context as { cloudflare?: { env?: Record<string, unknown> } })
    .cloudflare?.env
}

export async function notificar(event: H3Event, aviso: Aviso) {
  const env = bindings(event)
  const email = env?.EMAIL as BindingEmail | undefined
  const destino = (env?.AVISOS_DESTINO ?? process.env.AVISOS_DESTINO) as string | undefined
  const remitente = (env?.AVISOS_REMITENTE ?? process.env.AVISOS_REMITENTE) as string | undefined

  if (!email) throw new SinTransporte('falta el binding EMAIL en wrangler.jsonc')
  if (!destino) throw new SinTransporte('falta la variable AVISOS_DESTINO')
  if (!remitente) throw new SinTransporte('falta la variable AVISOS_REMITENTE')

  const texto = aviso.campos.map(([etiqueta, valor]) => `${etiqueta}:\n${valor}`).join('\n\n')

  const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#16181c">${
    aviso.campos
      .map(([etiqueta, valor]) => `<p style="margin:0 0 1em"><strong style="color:#6d747f;font-size:12px;text-transform:uppercase;letter-spacing:.08em">${
        escapar(etiqueta)
      }</strong><br>${escapar(valor).replace(/\n/g, '<br>')}</p>`)
      .join('')
  }</div>`

  await email.send({
    to: destino,
    from: { email: remitente, name: 'krahegwen.com' },
    replyTo: aviso.responderA,
    subject: aviso.asunto,
    text: texto,
    html,
  })
}
