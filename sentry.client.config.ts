import * as Sentry from '@sentry/nuxt'

/**
 * Sentry en el navegador.
 *
 * Deliberadamente pelado. Esto es una web de contenido estático de ~600 KB: meter
 * session replay o profiling costaría más peso que todo lo que vigilan. Solo
 * errores, y con el muestreo de trazas al mínimo.
 *
 * Sin DSN no se inicializa nada: en local y en las previews sin variable puesta,
 * el SDK queda inerte en lugar de tragarse los errores en silencio.
 */

const dsn = useRuntimeConfig().public.sentryDsn

if (dsn) {
  Sentry.init({
    dsn,
    environment: useRuntimeConfig().public.sentryEnvironment,

    /**
     * Nada de PII. Sin esto Sentry adjunta la IP del visitante a cada evento, y
     * en una web pública europea eso es un dato personal más que declarar y
     * custodiar a cambio de ninguna información útil: un error de JavaScript se
     * diagnostica con el stack, no con quién lo sufrió.
     */
    sendDefaultPii: false,

    /*
     * Cero, y no por ahorrar cuota: el SDK de Nuxt no soporta tracing sobre
     * Vercel (lo avisa el propio build). Un muestreo mayor que cero solo
     * produciría trazas incompletas que invitan a sacar conclusiones falsas.
     */
    tracesSampleRate: 0,

    // El ruido que no es mío y solo sirve para agotar la cuota gratuita.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Non-Error promise rejection captured/,
    ],
  })
}
