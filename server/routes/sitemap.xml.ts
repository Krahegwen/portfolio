import { identity } from '~~/content/profile'
import { projects } from '~~/content/projects'

/**
 * Sitemap con `hreflang` recíproco: cada URL declara su pareja en el otro
 * idioma. Sin la reciprocidad Google descarta las anotaciones y trata las dos
 * versiones como contenido duplicado, que es justo lo que el árbol `/en` intenta
 * evitar.
 *
 * Las rutas `/print/**` no salen aquí: existen solo para generar los PDF.
 */

const SITE = identity.site

interface Entry { es: string, en: string, priority: string }

const entries: Entry[] = [
  { es: '/', en: '/en', priority: '1.0' },
  { es: '/cv', en: '/en/cv', priority: '0.9' },
  { es: '/proyectos', en: '/en/projects', priority: '0.8' },
  ...projects.map(project => ({
    es: `/proyectos/${project.slug}`,
    en: `/en/projects/${project.slug}`,
    priority: '0.6',
  })),
]

export default defineEventHandler((event) => {
  const lastmod = new Date().toISOString().slice(0, 10)

  const urls = entries.flatMap(entry => (['es', 'en'] as const).map(locale => `
  <url>
    <loc>${SITE}${entry[locale]}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${entry.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${entry.es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${entry.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${entry.es}"/>
  </url>`))

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}
</urlset>
`
})
