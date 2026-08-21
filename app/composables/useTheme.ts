export type Theme = 'dark' | 'light'

/**
 * Tema. Por defecto oscuro; la elección se guarda en `localStorage` y la aplica
 * un plugin antes de pintar, para que no haya destello de tema equivocado.
 */
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'dark')

  function apply(next: Theme) {
    theme.value = next
    if (!import.meta.client) return
    document.documentElement.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#0a0b0d' : '#f6f3ee')
    try { localStorage.setItem('kw-theme', next) } catch { /* modo privado */ }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggle, apply }
}
