import roles from './roles.js'
import vt01 from './vt-01-argumentaire.js'
import vt02 from './vt-02-comparateur.js'
import vt03 from './vt-03-negociation.js'
import vt04 from './vt-04-annonce.js'
import vt05 from './vt-05-prospection.js'

export default {
  id: 'vente',
  slug: { fr: 'vente', en: 'sales' },
  icon: 'trend',
  label: { fr: 'Vente & achats', en: 'Sales & procurement' },
  summary: {
    fr: 'Convaincre un client, comparer des offres.',
    en: 'Win over a client, compare offers.'
  },
  roles,
  templates: [vt01, vt02, vt03, vt04, vt05]
}
