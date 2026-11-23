/**
 * Thème clair / sombre.
 * Par défaut : thème du système. Un clic sur le bouton lune / soleil force l'autre thème,
 * et ce choix est mémorisé (localStorage). Le script dans nuxt.config.ts l'applique avant
 * l'affichage (pas de flash). L'icône affichée est gérée en CSS selon [data-theme].
 */
export function useTheme () {
  const theme = useState('pf-theme', () => 'system') // 'system' | 'light' | 'dark'

  const systemIsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

  function apply () {
    if (import.meta.server) return
    const dark = theme.value === 'dark' || (theme.value === 'system' && systemIsDark())
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }

  function init () {
    try {
      const saved = localStorage.getItem('pf-theme')
      if (saved === 'light' || saved === 'dark') theme.value = saved
    } catch {}
    apply()
    // Tant que l'utilisateur n'a rien choisi, on suit les changements du système.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
  }

  /** Bascule vers le thème opposé à celui actuellement affiché. */
  function toggle () {
    theme.value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('pf-theme', theme.value) } catch {}
    apply()
  }

  return { theme, init, toggle }
}
