import * as Sentry from '@sentry/nuxt'

/**
 * Sentry en el servidor.
 *
 * Aquí Sentry hace dos trabajos: recoger los errores de las funciones de la API
 * y —esto es menos habitual— servir de canal de aviso para el formulario de
 * contacto y las descargas de CV (ver `server/utils/notificar.ts`).
 *
 * `sendDefaultPii: false` también aquí. El mensaje del formulario lleva el
 * correo de quien escribe porque sin él no se le puede contestar, y eso se
 * declara en la política de privacidad; lo que no hace falta es que Sentry
 * añada por su cuenta la IP y las cabeceras de cada petición.
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? 'development',
  sendDefaultPii: false,
  // Cero: el SDK de Nuxt no soporta tracing sobre Vercel. Errores y avisos sí.
  tracesSampleRate: 0,
  // Sin DSN el SDK ya no envía nada, pero dejarlo explícito evita que alguien
  // lea los `captureMessage` de notificar.ts y crea que en local salen a la red.
  enabled: Boolean(process.env.SENTRY_DSN),
})
