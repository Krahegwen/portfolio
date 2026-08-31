import { tienePase } from '../utils/pase'

/**
 * Las hojas de impresión de los CV no públicos, tras la misma cookie que sus PDF.
 *
 * Sin esto, cerrar la puerta del PDF no cerraría nada: `/print/cv/accenture` es
 * el mismo documento en HTML, con los nombres de cliente en texto plano, a una
 * dirección de distancia. Se protegen las dos o no se protege ninguna.
 *
 * Para que el Worker llegue a ver estas peticiones —son páginas prerrenderizadas
 * y Cloudflare las serviría como activo estático— están declaradas en
 * `run_worker_first` de wrangler.jsonc. Si alguien quita esa línea, esto deja de
 * ejecutarse en producción sin que nada falle; hay un test que lo vigila.
 */

/** Con lo que cuelgue detrás: también `/_payload.json`, que lleva lo mismo. */
const PRIVADA = /^\/(?:en\/)?print\/cv\/(?:anon|accenture)(?:\/|$)/

export default defineEventHandler((event) => {
  /*
   * El prerrenderizado del build sí las genera: de esas seis páginas salen los
   * seis PDF (`pnpm cv:pdf`), y el fichero prerrenderizado nunca llega a
   * servirse porque esta misma comprobación lo intercepta en producción.
   *
   * Y `nuxt dev` también las deja pasar, para poder trabajar en la hoja sin
   * tener que desbloquear nada. La puerta de verdad se prueba con `pnpm
   * preview`, que corre el build real contra el runtime de Cloudflare.
   */
  if (import.meta.prerender || import.meta.dev) return

  const ruta = event.path.split('?')[0] ?? ''
  if (!PRIVADA.test(ruta)) return

  if (tienePase(event)) return

  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
