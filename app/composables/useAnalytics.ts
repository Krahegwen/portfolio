import { track } from '@vercel/analytics'

/**
 * Eventos propios de Vercel Analytics.
 *
 * Un envoltorio de cuatro líneas, pero con dos razones para existir: `track` no
 * hace nada fuera de Vercel y conviene que eso no reviente en local, y así los
 * nombres de evento están todos declarados en un sitio en lugar de escritos a
 * mano en cada componente —donde `cv_descarga` y `cv_descargado` acabarían
 * conviviendo y contando la mitad cada uno.
 */

export type Evento =
  | 'cv_descargado'
  | 'cv_variante_vista'
  | 'contacto_enviado'
  | 'proyecto_abierto'

export function useAnalytics() {
  function evento(nombre: Evento, datos?: Record<string, string | number | boolean>) {
    if (!import.meta.client) return
    try {
      track(nombre, datos)
    }
    catch {
      // Analítica caída no puede romper la interacción que la disparó.
    }
  }

  return { evento }
}
