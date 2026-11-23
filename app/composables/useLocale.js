import { UI } from '~/locales/ui.js'

export const LOCALES = ['fr', 'en']

/**
 * i18n minimal, sans dépendance. Langue partagée (useState) et mémorisée (cookie).
 * À remplacer par @nuxtjs/i18n le moment venu (URL par langue, meilleur référencement).
 *
 *   t('clé', { n: 2 })  → texte de l'interface
 *   l({ fr, en })       → texte d'une donnée de template
 */
export function useLocale () {
  const cookie = useCookie('pf-locale', { default: () => 'fr', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  // Toujours 'fr' au démarrage : les pages sont pré-rendues en français, et le serveur comme le
  // navigateur doivent partir du même état. La langue mémorisée est appliquée juste après
  // l'hydratation par plugins/locale.client.js.
  const locale = useState('pf-locale', () => 'fr')

  function setLocale (value) {
    if (!LOCALES.includes(value)) return
    locale.value = value
    cookie.value = value
  }

  function t (key, vars) {
    const text = UI[locale.value]?.[key] ?? UI.fr[key] ?? key
    return vars ? text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : text
  }

  const l = obj => localize(obj, locale.value)

  return { locale, setLocale, t, l }
}
