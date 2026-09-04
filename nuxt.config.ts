// https://nuxt.com/docs/api/configuration/nuxt-config
import { identity, tagline } from './content/profile'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],

  css: ['~/assets/css/fonts.css', '~/assets/css/tokens.css', '~/assets/css/base.css'],

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
    // Los CV privados tampoco: no son ficheros de `public/`, los sirve una ruta
    // del Worker que antes pide la cookie del pase.
    '/cv/privado/**': { prerender: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0a0b0d' },
        /*
         * Tarjeta de enlace por defecto, aquí por el mismo motivo que el beacon
         * de más abajo: `404.html` se prerenderiza como cáscara de cliente
         * (`data-ssr="false"`) y no recoge lo que declara un componente. Con la
         * tarjeta solo en `app.vue`, un enlace roto pegado en un chat salía como
         * una caja gris sin texto ni imagen — y es justo el enlace que más falta
         * hace explicar.
         *
         * En castellano y sin `og:url`: es lo único que se puede decidir al
         * compilar, y en un 404 la URL buena es la que pegó quien comparte.
         * `app.vue` sobrescribe por clave en cada página de verdad, con el
         * idioma y la canónica que toquen.
         */
        { property: 'og:title', content: `${identity.name} — ${identity.title.es}` },
        { property: 'og:description', content: tagline.es },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: identity.name },
        { property: 'og:image', content: `${identity.site}/og.png` },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${identity.name} — ${identity.title.es}` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${identity.site}/og.png` },
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
      /*
       * Cloudflare Web Analytics.
       *
       * Va en la cabecera base y no en un `useHead` de `app.vue`, y el motivo
       * es `404.html`: Nuxt la prerenderiza como cáscara de cliente
       * (`data-ssr="false"`), así que lo que declara un componente no llega a
       * su HTML. Con el beacon en `app.vue` salía en 28 de las 29 páginas, y la
       * que faltaba era justo la que ve quien llega de un enlace roto. Desde
       * aquí entra en las 29.
       *
       * Se lee de `process.env` **al compilar**, que es cuando de verdad se
       * decide: las páginas son ficheros estáticos que Cloudflare sirve sin
       * invocar al Worker, así que una variable de ejecución no las tocaría.
       * La variable conserva el prefijo `NUXT_PUBLIC_` por costumbre y porque
       * así está escrita en el `.env` y en DESPLIEGUE.md, aunque ya no pase por
       * `runtimeConfig`. Sin token no se inyecta nada y en local no se mide.
       *
       * No pone cookies ni identificador persistente, que es la razón por la
       * que esta web no lleva muro de consentimiento. Ver /privacidad y los
       * tests que lo vigilan.
       */
      script: [
        ...(process.env.NUXT_PUBLIC_ANALYTICS_TOKEN
          ? [{
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'defer': true,
              'data-cf-beacon': JSON.stringify({ token: process.env.NUXT_PUBLIC_ANALYTICS_TOKEN }),
            }]
          : []),
      ],
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  future: { compatibilityVersion: 4 },
})
