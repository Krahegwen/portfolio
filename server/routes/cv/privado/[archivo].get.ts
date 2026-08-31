import { FICHEROS_PRIVADOS } from '../../../../content/cv'
import { tienePase } from '../../../utils/pase'

/**
 * Descarga de los CV que no son el público.
 *
 * Estos cuatro PDF **no están en `public/`**, y no es un detalle de orden: en el
 * preset de Cloudflare, todo lo que hay en `public/` lo sirve el Worker de
 * activos antes de que Nitro llegue a mirar la petición, así que un fichero ahí
 * dentro no se puede proteger. Viven en `server/assets/cv/`, empaquetados dentro
 * del propio Worker, y esta ruta es la única puerta que tienen.
 *
 * Sin pase se responde 404 y no 403: un 403 confirma que el fichero existe y
 * cuál es su nombre exacto, que es justo lo que no hace falta contarle a quien
 * está probando direcciones.
 */

export default defineEventHandler(async (event) => {
  const archivo = getRouterParam(event, 'archivo') ?? ''

  // Lista blanca, no saneado: el nombre no se compone, se elige de un conjunto
  // cerrado. Así no hay recorrido de directorios que discutir.
  if (!FICHEROS_PRIVADOS.includes(archivo)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  if (!tienePase(event)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const pdf = await useStorage('assets:server').getItemRaw<Uint8Array>(`cv/${archivo}`)

  if (!pdf) {
    console.error(`[cv] falta el PDF privado ${archivo} en server/assets/cv/`)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  return new Response(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${archivo}"`,
      // Que no se quede en la caché de ninguna intermediaria: la respuesta
      // depende de una cookie, y una copia compartida serviría el PDF a quien
      // no trae ninguna.
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  })
})
