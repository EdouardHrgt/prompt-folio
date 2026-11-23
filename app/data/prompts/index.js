/**
 * Point d'entrée des données de prompts.
 * Ajouter un domaine = créer son dossier (roles.js + templates + index.js) et l'ajouter ici.
 */
import gestionProjet from './gestion-projet/index.js'

export const DOMAINS = [
  gestionProjet,
  // Domaines prévus : affichés « bientôt » dans l'interface, sans templates.
  { id: 'vente', slug: { fr: 'vente', en: 'sales' }, icon: 'trend', label: { fr: 'Vente', en: 'Sales' }, comingSoon: true, roles: {}, templates: [] },
  { id: 'developpement', slug: { fr: 'developpement', en: 'development' }, icon: 'code', label: { fr: 'Développement', en: 'Development' }, comingSoon: true, roles: {}, templates: [] },
  { id: 'evenementiel', slug: { fr: 'evenementiel', en: 'events' }, icon: 'calendar', label: { fr: 'Événementiel', en: 'Events' }, comingSoon: true, roles: {}, templates: [] },
  { id: 'creatif', slug: { fr: 'creatif', en: 'creative' }, icon: 'sparkles', label: { fr: 'Créatif', en: 'Creative' }, comingSoon: true, roles: {}, templates: [] }
]

export function getDomain (id) {
  return DOMAINS.find(d => d.id === id)
}

/** Retrouve un template par id ; renvoie { template, domain } ou null. */
export function getTemplate (id) {
  for (const domain of DOMAINS) {
    const template = domain.templates.find(t => t.id === id)
    if (template) return { template, domain }
  }
  return null
}

/** Retrouve un template par slug localisé (pour les routes /fr/gestion-de-projet/chemin-critique-pert). */
export function getTemplateBySlug (domainSlug, templateSlug, locale = 'fr') {
  const domain = DOMAINS.find(d => d.slug[locale] === domainSlug)
  const template = domain?.templates.find(t => t.slug[locale] === templateSlug)
  return template ? { template, domain } : null
}
