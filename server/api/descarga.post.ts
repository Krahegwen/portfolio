import { notificar } from '../utils/notificar'

/**
 * Aviso de descarga de CV.
 *
 * El PDF es un fichero estático que sirve Vercel sin pasar por aquí, así que la
 * página avisa por su cuenta antes de arrancar la descarga. Consecuencia: este
 * contador es una aproximación, no una verdad —quien entra directo a la URL del
 * PDF, o con el JavaScript apagado, no aparece—. Preferible a interponer una
 * redirección entre la persona y su descarga solo para poder contarla.
 *
 * **Aquí no se registra quién.** Ni IP, ni user-agent, ni referrer: qué variante,
 * en qué idioma y cuándo. Saber que hoy se han bajado tres CV en inglés es útil;
 * saber quién lo hizo no lo es, y convertiría una métrica en un fichero de datos
 * personales con todo lo que eso arrastra.
 */

const VARIANTES = ['recruiter', 'anon', 'accenture'] as const
const IDIOMAS = ['es', 'en'] as const

interface Cuerpo {
  variante?: string
  idioma?: string
}

export default defineEventHandler(async (event) => {
  const cuerpo = await readBody<Cuerpo>(event).catch(() => null)

  const variante = VARIANTES.find(v => v === cuerpo?.variante)
  const idioma = IDIOMAS.find(i => i === cuerpo?.idioma)

  // Un cuerpo que no encaja es un bot probando la ruta. 204 y a otra cosa: no
  // hay nada que contarle ni nada que anotar.
  if (!variante || !idioma) {
    setResponseStatus(event, 204)
    return null
  }

  notificar({
    tipo: 'descarga-cv',
    titulo: `Descarga de CV — ${variante} (${idioma.toUpperCase()})`,
    datos: { variante, idioma, momento: new Date().toISOString() },
  })

  setResponseStatus(event, 204)
  return null
})
