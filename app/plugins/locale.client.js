/**
 * Les pages sont pré-rendues en français (génération statique) : l'état embarqué dans la page
 * vaut donc 'fr'. Après le chargement, on réapplique la langue mémorisée dans le cookie.
 * (Avec @nuxtjs/i18n et des URL par langue — /fr, /en — ce plugin deviendra inutile.)
 */
export default defineNuxtPlugin(() => {
  const locale = useState('pf-locale', () => 'fr')
  // onNuxtReady : une fois l'hydratation entièrement terminée (pages asynchrones comprises).
  onNuxtReady(() => {
    const match = document.cookie.match(/(?:^|; )pf-locale=([^;]+)/)
    const saved = match && decodeURIComponent(match[1])
    if (LOCALES.includes(saved) && saved !== locale.value) locale.value = saved
  })
})
