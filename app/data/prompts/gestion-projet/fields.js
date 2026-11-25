/**
 * Champs métier du domaine Gestion de projet (niveau 2 de la bibliothèque de champs).
 * Partagés par les tâches du domaine ; chaque template peut surcharger (libellé, groupe…).
 *
 *   PM.budget({ group: 'contraintes' })
 */
import { F } from '../fields.js'

export const PM = {
  objective: (o = {}) => F.textarea('OBJECTIF', { fr: 'Objectif du projet', en: 'Project objective' }, {
    required: true,
    promptLabel: { fr: 'Objectif', en: 'Objective' },
    placeholder: { fr: 'Ex. : refondre le site e-commerce B2B et ajouter le paiement en ligne', en: 'E.g. rebuild the B2B e-commerce site and add online payment' },
    ...o
  }),

  deliverable: (o = {}) => F.text('LIVRABLE', { fr: 'Livrable final', en: 'Final deliverable' }, {
    placeholder: { fr: 'Ex. : site en production', en: 'E.g. website live in production' },
    ...o
  }),

  scope: (o = {}) => F.textarea('PERIMETRE', { fr: 'Périmètre', en: 'Scope' }, {
    help: { fr: 'Ce qui est inclus et ce qui est exclu.', en: 'What is in scope and what is out.' },
    ...o
  }),

  projectName: (o = {}) => F.text('NOM_PROJET', { fr: 'Nom du projet', en: 'Project name' }, {
    required: true,
    promptLabel: { fr: 'Nom', en: 'Name' },
    placeholder: { fr: 'Ex. : Déploiement CRM — 4 agences', en: 'E.g. CRM rollout — 4 branches' },
    ...o
  }),

  deadline: (o = {}) => F.date('ECHEANCE', { fr: 'Échéance', en: 'Deadline' }, o),

  budget: (o = {}) => F.text('BUDGET', { fr: 'Budget', en: 'Budget' }, {
    placeholder: { fr: 'Ex. : 60 k€', en: 'E.g. €60k' },
    ...o
  }),

  team: (o = {}) => F.text('EQUIPE', { fr: 'Équipe disponible', en: 'Available team' }, {
    placeholder: { fr: 'Ex. : 3 développeurs, 1 designer', en: 'E.g. 3 developers, 1 designer' },
    ...o
  }),

  risks: (o = {}) => F.textarea('RISQUES', { fr: 'Risques identifiés', en: 'Identified risks' }, o),

  /** Méthode de gestion de projet. */
  method: (o = {}) => F.choice('segmented', 'METHODE', { fr: 'Méthode', en: 'Method' }, [
    { value: 'cycle-v', label: { fr: 'Cycle en V', en: 'Waterfall' }, prompt: { fr: 'cycle en V (séquentiel)', en: 'waterfall (sequential)' } },
    { value: 'agile', label: { fr: 'Agile', en: 'Agile' }, prompt: { fr: 'agile / Scrum (itérations)', en: 'agile / Scrum (iterations)' } },
    { value: 'hybride', label: { fr: 'Hybride', en: 'Hybrid' }, prompt: { fr: 'hybride (cadrage séquentiel, réalisation itérative)', en: 'hybrid (sequential scoping, iterative delivery)' } }
  ], { default: 'hybride', ...o })
}
