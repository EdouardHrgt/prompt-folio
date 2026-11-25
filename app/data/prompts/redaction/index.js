import roles from './roles.js'
import rd01 from './rd-01-reecrire.js'
import rd02 from './rd-02-email-delicat.js'

export default {
  id: 'redaction',
  slug: { fr: 'redaction', en: 'writing' },
  icon: 'pen',
  label: { fr: 'Rédaction & communication', en: 'Writing & communication' },
  summary: {
    fr: 'Réécrire un texte, trouver les mots justes dans un email délicat.',
    en: 'Rewrite a text, find the right words for a difficult email.'
  },
  roles,
  templates: [rd01, rd02]
}
