import roles from './roles.js'
import gp01 from './gp-01-decoupage.js'
import gp02 from './gp-02-pert.js'
import gp03 from './gp-03-bilan.js'
import gp04 from './gp-04-presentation.js'

export default {
  id: 'gestion-projet',
  slug: { fr: 'gestion-de-projet', en: 'project-management' },
  icon: 'kanban',
  label: { fr: 'Gestion de projet', en: 'Project management' },
  summary: {
    fr: 'Découper, planifier, présenter et clôturer vos projets.',
    en: 'Break down, plan, present and close your projects.'
  },
  roles,
  templates: [gp01, gp02, gp03, gp04]
}
