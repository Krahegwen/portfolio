import * as Sentry from '@sentry/nuxt'

/**
 * El único sitio del proyecto que emite un aviso.
 *
 * El transporte hoy es Sentry, que es lo que ya está montado para errores y trae
 * reglas de alerta por correo sin necesidad de dar de alta otro proveedor ni
 * custodiar otra clave de API. La contrapartida es que los mensajes de contacto
 * viven en Sentry y no en una bandeja de entrada.
 *
 * Si algún día conviene un correo de verdad (Resend, Cloudflare Email, lo que
 * sea), se reescribe esta función y nada más: ni las rutas de la API ni el
 * formulario saben por dónde sale el aviso.
 */

export type TipoAviso = 'contacto' | 'descarga-cv'

interface Aviso {
  tipo: TipoAviso
  titulo: string
  /**
   * Datos que acompañan al aviso. Van como `extra` de Sentry, así que **no
   * metas aquí nada que no quieras conservar**: para `descarga-cv` esto es
   * siempre qué variante y en qué idioma, nunca quién.
   */
  datos: Record<string, string | number | boolean | undefined>
}

export function notificar({ tipo, titulo, datos }: Aviso) {
  Sentry.withScope((scope) => {
    // La etiqueta es lo que permite filtrar en Sentry y montar una regla de
    // alerta distinta por tipo: el contacto avisa siempre, la descarga no.
    scope.setTag('aviso', tipo)
    scope.setLevel('info')
    scope.setContext('aviso', datos)
    Sentry.captureMessage(titulo)
  })
}
