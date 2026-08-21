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

  /** Prefija una ruta con el idioma actual. `localePath('/cv')` → `/en/cv`. */
  function localePath(path: string): string {
    if (locale.value === 'es') return path
    return path === '/' ? '/en' : `/en${path}`
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

/** Los dos segmentos que difieren entre árboles. El resto de la ruta es idéntico. */
const SLUGS: Record<Locale, { projects: string }> = {
  es: { projects: 'proyectos' },
  en: { projects: 'projects' },
}

function translateSlugs(path: string, to: Locale): string {
  const from: Locale = to === 'es' ? 'en' : 'es'
  return path.replace(
    new RegExp(`^/${SLUGS[from].projects}(/|$)`),
    `/${SLUGS[to].projects}$1`,
  )
}

/** La base de rutas de proyectos en el idioma activo. */
export function useProjectsBase() {
  const { locale } = useLocale()
  return computed(() => (locale.value === 'en' ? '/en/projects' : '/proyectos'))
}
