import type { CvVariant, Locale } from './profile'

/**
 * Nombres y direcciones de los seis PDF del CV, en un solo sitio.
 *
 * Los usan la página `/cv`, la ruta que sirve los privados y —a mano, porque es
 * `.mjs` y no puede importar TypeScript— `scripts/build-cv-pdfs.mjs`. Hay un
 * test que comprueba que el script sigue coincidiendo con esto.
 */

export const VARIANTES: CvVariant[] = ['recruiter', 'anon', 'accenture']

/**
 * Las que no son públicas. La anónima porque un CV sin nombre puesto en una web
 * con nombre es un chiste, y la interna porque nombra clientes.
 */
export const PRIVADAS: CvVariant[] = ['anon', 'accenture']

export function esPrivada(variante: CvVariant) {
  return PRIVADAS.includes(variante)
}

const SUFIJO: Record<CvVariant, string> = {
  recruiter: '',
  anon: '-Anon',
  accenture: '-Accenture',
}

export function ficheroCv(variante: CvVariant, locale: Locale) {
  return `Diego-Portilla-CV${SUFIJO[variante]}-${locale.toUpperCase()}.pdf`
}

/**
 * La pública sale de `public/cv/` como activo estático, sin tocar el Worker. Las
 * otras dos cuelgan de `/cv/privado/`, que **no existe como fichero**: las sirve
 * `server/routes/cv/privado/[archivo].get.ts` previa cookie.
 */
export function urlCv(variante: CvVariant, locale: Locale) {
  const fichero = ficheroCv(variante, locale)
  return esPrivada(variante) ? `/cv/privado/${fichero}` : `/cv/${fichero}`
}

/** Lista blanca de lo que la ruta privada acepta servir. */
export const FICHEROS_PRIVADOS = PRIVADAS.flatMap(
  variante => (['es', 'en'] as Locale[]).map(locale => ficheroCv(variante, locale)),
)
