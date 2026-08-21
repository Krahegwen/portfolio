// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@sentry/nuxt/module',
    /*
     * Analíticas de Vercel. Sin cookies y sin identificador persistente: no
     * guardan nada en el navegador de quien visita, que es la razón por la que
     * esta web no necesita un muro de consentimiento. Ver /privacidad.
     *
     * Fuera de Vercel (local, o un despliegue en otro sitio) los dos módulos se
     * quedan inertes por su cuenta.
     */
    '@vercel/analytics/nuxt',
    '@vercel/speed-insights/nuxt',
  ],

  css: ['~/assets/css/fonts.css', '~/assets/css/tokens.css', '~/assets/css/base.css'],

  runtimeConfig: {
    public: {
      // Sin DSN, Sentry queda inerte: ni en local ni en una preview sin la
      // variable puesta se envía nada a ninguna parte.
      sentryDsn: '',
      sentryEnvironment: 'development',
    },
  },

  // Casi todo es contenido fijo y se prerrenderiza en el build. Las únicas dos
  // rutas que ejecutan algo en producción son las de `server/api/`: el
  // formulario de contacto y el aviso de descarga.
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
    // Una función serverless no se puede prerrenderizar, y sin esta regla el
    // build lo intenta y falla.
    '/api/**': { prerender: false },
  },

  sentry: {
    /*
     * La subida de source maps solo ocurre con SENTRY_AUTH_TOKEN presente. Sin
     * él el build sigue adelante en lugar de romperse, que es lo que hace falta
     * para que cualquiera pueda clonar el repo y compilar sin credenciales.
     */
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    },
    autoInjectServerSentry: 'top-level-import',
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

  /*
   * Source maps de cliente para Sentry. Sin esto los stacks llegan minificados y
   * el error solo dice en qué carácter de `entry.BxKq.js` reventó, que no sirve.
   * `hidden` genera el mapa pero no deja el comentario `//# sourceMappingURL` en
   * el bundle: lo sube el plugin de Sentry en el build y no queda expuesto.
   */
  sourcemap: { client: 'hidden', server: true },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  future: { compatibilityVersion: 4 },
})
