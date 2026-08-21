import { notificar } from '../utils/notificar'

/**
 * Aviso de descarga de CV.
 *
 * El PDF es un fichero estático que sirve Cloudflare sin pasar por aquí, así que
 * la página avisa por su cuenta antes de arrancar la descarga. Consecuencia:
 * este recuento es una aproximación, no una verdad —quien entra directo a la URL
 * del PDF, o con el JavaScript apagado, no aparece—. Preferible a interponer una
 * redirección entre la persona y su descarga solo para poder contarla.
 *
 * **Aquí no se registra quién.** Ni IP, ni user-agent, ni cabecera de
 * procedencia: qué variante, en qué idioma y cuándo. Saber que hoy se han bajado
 * tres CV en inglés es útil; saber quién lo hizo no lo es, y convertiría una
 * métrica en un fichero de datos personales con todo lo que eso arrastra.
 */

const VARIANTES = ['recruiter', 'anon', 'accenture'] as const
const IDIOMAS = ['es', 'en'] as const

/**
 * Ventana de silencio por combinación variante+idioma.
 *
 * Sin esto, alguien curioseando las seis versiones genera seis correos en medio
 * minuto, y un buzón que avisa seis veces de lo mismo se acaba filtrando entero
 * —incluidos los avisos de contacto, que sí importan—.
 */
const SILENCIO_MS = 30 * 60 * 1000
const ultimoAviso = new Map<string, number>()

interface Cuerpo {
  variante?: string
  idioma?: string
}

export default defineEventHandler(async (event) => {
  const cuerpo = await readBody<Cuerpo>(event).catch(() => null)

  const variante = VARIANTES.find(v => v === cuerpo?.variante)
  const idioma = IDIOMAS.find(i => i === cuerpo?.idioma)

  // Un cuerpo que no encaja es un bot probando la ruta. 204 y a otra cosa.
  if (!variante || !idioma) {
    setResponseStatus(event, 204)
    return null
  }

  // Se puede apagar del todo sin tocar código: `AVISAR_DESCARGAS=no`.
  const env = (event.context as { cloudflare?: { env?: Record<string, unknown> } }).cloudflare?.env
  const activo = (env?.AVISAR_DESCARGAS ?? process.env.AVISAR_DESCARGAS ?? 'si') !== 'no'

  const ahora = Date.now()
  const clave = `${variante}:${idioma}`
  const reciente = (ultimoAviso.get(clave) ?? 0) > ahora - SILENCIO_MS

  if (activo && !reciente) {
    ultimoAviso.set(clave, ahora)
    try {
      await notificar(event, {
        tipo: 'descarga-cv',
        titulo: '📄 CV descargado',
        campos: [
          ['Variante', variante],
          ['Idioma', idioma === 'es' ? 'Español' : 'Inglés'],
        ],
      })
    }
    catch (error) {
      // Que no salga el aviso no es motivo para estropearle la descarga a nadie.
      console.error('[descarga] el aviso no salió:', error)
    }
  }

  setResponseStatus(event, 204)
  return null
})
