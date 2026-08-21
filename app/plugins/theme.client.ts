/**
 * Aplica el tema guardado en cuanto el cliente arranca.
 * Va acompañado de un script inline en app.vue que lo hace antes del primer
 * pintado; este plugin solo mantiene sincronizado el estado de Vue con el DOM.
 */
export default defineNuxtPlugin(() => {
  const { apply } = useTheme()
  let stored: string | null = null
  try { stored = localStorage.getItem('kw-theme') } catch { /* modo privado */ }
  apply(stored === 'light' ? 'light' : 'dark')
})
