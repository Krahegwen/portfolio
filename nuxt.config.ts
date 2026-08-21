// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],

  css: ['~/assets/css/fonts.css', '~/assets/css/tokens.css', '~/assets/css/base.css'],

  runtimeConfig: {
    public: {
      /*
       * Token de Cloudflare Web Analytics. Sin él no se inyecta el script, así
       * que en local y en cualquier despliegue sin la variable no se mide nada.
       *
       * Es analítica sin cookies y sin identificador persistente, que es la
       * razón por la que esta web no lleva muro de consentimiento. Ver
       * /privacidad, y los tests que lo vigilan.
       */
      analyticsToken: '',
    },
  },

  // Casi todo es contenido fijo y se prerrenderiza en el build, y Cloudflare lo
  // sirve como activo estático sin invocar el Worker. Las únicas dos rutas que
  // ejecutan algo son las de `server/api/`: el formulario y el aviso de descarga.
  nitro: {
    preset: 'cloudflare_module',
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
    // Una función serverless no se puede prerrenderizar, y sin esta regla el
    // build lo intenta y falla.
    '/api/**': { prerender: false },
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
        /*
         * Las dos caras que salen en el primer pintado, precargadas. El resto
         * las descubre el navegador por el CSS cuando hacen falta; adelantar
         * las dieciocho competiría con el HTML por el ancho de banda inicial.
         */
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/instrument-serif-400-latin.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/space-grotesk-400-latin.woff2', crossorigin: '' },
      ],
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  future: { compatibilityVersion: 4 },
})
