// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],

  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],

  // Sitio de contenido fijo: no hay razón para que Vercel ejecute nada en runtime.
  // Todo se prerrenderiza en build y se sirve como estático.
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/en',
        '/404.html',
        '/sitemap.xml',
        // Las hojas de impresión no se enlazan desde ninguna página, así que el
        // rastreador de enlaces no llegaría solo: hay que nombrarlas.
        //
        // El árbol inglés cuelga de /en/print y no de /print/en porque el idioma
        // se deduce del prefijo /en de la ruta. Con /print/en los seis PDF salían
        // en español sin que nada fallara.
        ...['recruiter', 'anon', 'accenture'].flatMap(v => [
          `/print/cv/${v}`,
          `/en/print/cv/${v}`,
        ]),
      ],
    },
  },

  routeRules: {
    '/**': { prerender: true },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0a0b0d' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  future: { compatibilityVersion: 4 },
})
