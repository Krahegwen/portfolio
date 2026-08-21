import type { I18nText, Locale } from '~~/content/profile'

/**
 * i18n mínimo, sin módulo.
 *
 * El idioma sale de la ruta (`/en/...` es inglés, el resto español) y no de una
 * cookie: así cada idioma tiene una URL propia que se prerrenderiza, se indexa y
 * se puede compartir. Una preferencia guardada que reescribiese la página serviría
 * contenido distinto en la misma dirección, que es justo lo que rompe el SEO.
 */

export function useLocale() {
  const route = useRoute()
  const locale = computed<Locale>(() => (route.path === '/en' || route.path.startsWith('/en/') ? 'en' : 'es'))

  /** Elige la rama del texto. Acepta strings tal cual para no obligar a traducir marcas. */
  function t(value: I18nText | string): string {
    return typeof value === 'string' ? value : value[locale.value]
  }

  /**
   * Prefija una ruta con el idioma actual y traduce el segmento si lo tiene.
   * `localePath('/cv')` → `/en/cv`; `localePath('/privacidad')` → `/en/privacy`.
   */
  function localePath(path: string): string {
    if (locale.value === 'es') return path
    const traducida = translateSlugs(path, 'en')
    return traducida === '/' ? '/en' : `/en${traducida}`
  }

  /** La misma página en el otro idioma, para el conmutador y el `hreflang`. */
  const alternatePath = computed(() => {
    const path = route.path
    if (locale.value === 'en') {
      const stripped = path.replace(/^\/en/, '') || '/'
      return translateSlugs(stripped, 'es')
    }
    const translated = translateSlugs(path, 'en')
    return translated === '/' ? '/en' : `/en${translated}`
  })

  return { locale, t, localePath, alternatePath }
}

/**
 * Los segmentos que difieren entre árboles. El resto de la ruta es idéntico, así
 * que el conmutador de idioma solo tiene que traducir el primero.
 *
 * Si algún día se añade una página con slug propio y no se apunta aquí, el
 * conmutador llevará a un 404 en el otro idioma. Hay un test que lo comprueba.
 */
const SLUGS: Record<Locale, Record<string, string>> = {
  es: { projects: 'proyectos', privacy: 'privacidad' },
  en: { projects: 'projects', privacy: 'privacy' },
}

function translateSlugs(path: string, to: Locale): string {
  const from: Locale = to === 'es' ? 'en' : 'es'
  for (const clave of Object.keys(SLUGS.es)) {
    const origen = SLUGS[from][clave]!
    const destino = SLUGS[to][clave]!
    const patron = new RegExp(`^/${origen}(/|$)`)
    if (patron.test(path)) return path.replace(patron, `/${destino}$1`)
  }
  return path
}

/** La base de rutas de proyectos en el idioma activo. */
export function useProjectsBase() {
  const { locale } = useLocale()
  return computed(() => (locale.value === 'en' ? '/en/projects' : '/proyectos'))
}
