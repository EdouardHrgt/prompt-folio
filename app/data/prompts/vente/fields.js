/**
 * Champs métier du domaine Vente & achats (niveau 2 de la bibliothèque de champs).
 * L'offre, l'interlocuteur, les preuves et la concurrence reviendront dans les prochaines
 * tâches du domaine (objections, proposition commerciale, prospection…).
 *
 *   SALES.offerName({ group: 'offre' })
 */
import { F } from '../fields.js'

export const PROOF_TYPES = [
  { value: 'chiffre', label: { fr: 'Résultat chiffré', en: 'Measured result' } },
  { value: 'temoignage', label: { fr: 'Témoignage', en: 'Testimonial' } },
  { value: 'reference', label: { fr: 'Référence client', en: 'Client reference' } },
  { value: 'certification', label: { fr: 'Certification / label', en: 'Certification / label' } }
]

export const CLIENT_TYPES = [
  { value: 'b2b', label: { fr: 'Professionnels', en: 'Businesses' }, prompt: { fr: 'professionnel (B2B)', en: 'business (B2B)' } },
  { value: 'b2c', label: { fr: 'Particuliers', en: 'Consumers' }, prompt: { fr: 'particulier (B2C)', en: 'consumer (B2C)' } }
]

export const COMPANY_SIZES = [
  { value: '', label: { fr: 'Non précisée', en: 'Not specified' } },
  { value: 'tpe', label: { fr: 'TPE', en: 'Micro-business' }, prompt: { fr: 'TPE (moins de 10 salariés)', en: 'micro-business (fewer than 10 employees)' } },
  { value: 'pme', label: { fr: 'PME', en: 'SME' }, prompt: { fr: 'PME (10 à 250 salariés)', en: 'SME (10 to 250 employees)' } },
  { value: 'eti', label: { fr: 'ETI', en: 'Mid-market' }, prompt: { fr: 'ETI (250 à 5 000 salariés)', en: 'mid-market company (250 to 5,000 employees)' } },
  { value: 'grand-compte', label: { fr: 'Grand compte', en: 'Enterprise' }, prompt: { fr: 'grand compte', en: 'large enterprise' } }
]

const CONTACTS = [
  { fr: 'Dirigeant / DG', en: 'CEO / Managing director' },
  { fr: 'Directeur financier (DAF)', en: 'CFO' },
  { fr: 'DRH', en: 'HR director' },
  { fr: 'DSI', en: 'CIO / IT director' },
  { fr: 'Acheteur', en: 'Buyer' },
  { fr: 'Directeur commercial', en: 'Sales director' },
  { fr: 'Directeur marketing', en: 'Marketing director' },
  { fr: 'Responsable opérationnel', en: 'Operations manager' },
  { fr: 'Indépendant / artisan', en: 'Freelancer / tradesperson' }
]

export const PROFILES = [
  { fr: 'Particulier', en: 'Individual' },
  { fr: 'Jeune couple', en: 'Young couple' },
  { fr: 'Famille avec enfants', en: 'Family with children' },
  { fr: 'Primo-accédant', en: 'First-time buyer' },
  { fr: 'Investisseur particulier', en: 'Private investor' },
  { fr: 'Retraité', en: 'Retiree' },
  { fr: 'Étudiant', en: 'Student' }
]

const b2c = v => v.TYPE_CLIENT === 'b2c'

const labelOf = (list, value, locale) => list.find(o => o.value === value)?.label[locale] ?? value

export const SALES = {
  offerName: (o = {}) => F.text('NOM_OFFRE', { fr: 'Nom de l\'offre', en: 'Offer name' }, {
    required: true,
    promptLabel: { fr: 'Nom', en: 'Name' },
    placeholder: { fr: 'Ex. : Planif\'RH, logiciel de planning SaaS', en: 'E.g. ShiftPro, SaaS scheduling software' },
    ...o
  }),

  offerDescription: (o = {}) => F.textarea('OFFRE', { fr: 'Ce que fait l\'offre', en: 'What the offer does' }, {
    required: true,
    promptLabel: { fr: 'Description', en: 'Description' },
    help: { fr: 'Fonctionnalités ou prestations clés, en quelques lignes.', en: 'Key features or services, in a few lines.' },
    ...o
  }),

  price: (o = {}) => F.text('PRIX', { fr: 'Prix', en: 'Price' }, {
    placeholder: { fr: 'Ex. : 9 € / utilisateur / mois', en: 'E.g. €9 / user / month' },
    ...o
  }),

  differentiators: (o = {}) => F.tags('DIFFERENCIANTS', { fr: 'Ce qui vous différencie', en: 'What sets you apart' }, {
    promptLabel: { fr: 'Différenciants', en: 'Differentiators' },
    placeholder: { fr: 'Ex. : hébergé en France', en: 'E.g. EU-hosted' },
    ...o
  }),

  /** Professionnels ou particuliers : adapte les champs de la cible et le prompt. */
  clientType: (o = {}) => F.choice('segmented', 'TYPE_CLIENT', { fr: 'Vous vendez à', en: 'You sell to' }, CLIENT_TYPES, {
    promptLabel: { fr: 'Type de client', en: 'Client type' },
    ...o
  }),

  contact: (o = {}) => F.combobox('INTERLOCUTEUR', { fr: 'Fonction', en: 'Job title' }, {
    required: true,
    showIf: v => !b2c(v),
    promptLabel: { fr: 'Interlocuteur', en: 'Contact' },
    help: { fr: 'Choisissez dans la liste ou saisissez le vôtre.', en: 'Pick from the list or type your own.' },
    options: CONTACTS.map(c => ({ value: c.fr, label: c })),
    ...o
  }),

  profile: (o = {}) => F.combobox('PROFIL_CLIENT', { fr: 'Profil', en: 'Profile' }, {
    required: true,
    showIf: b2c,
    promptLabel: { fr: 'Profil du client', en: 'Client profile' },
    help: { fr: 'Choisissez dans la liste ou décrivez-le : « jeune couple, premier achat, budget 250 k€ ».', en: 'Pick from the list or describe them: "young couple, first purchase, €250k budget".' },
    options: PROFILES.map(c => ({ value: c.fr, label: c })),
    ...o
  }),

  companySize: (o = {}) => F.choice('chips', 'TAILLE_CIBLE', { fr: 'Taille de l\'organisation', en: 'Organisation size' }, COMPANY_SIZES, {
    required: false,
    promptLabel: { fr: 'Taille', en: 'Size' },
    showIf: v => !b2c(v),
    ...o
  }),

  stakes: (o = {}) => F.textarea('ENJEUX', { fr: 'Enjeux et difficultés connus', en: 'Known stakes and pain points' }, {
    placeholder: { fr: 'Ex. : turnover élevé, plannings faits sur Excel ; ou : deuxième enfant en route, besoin d\'une chambre de plus', en: 'E.g. high turnover, schedules built in Excel; or: second child on the way, need an extra bedroom' },
    ...o
  }),

  proofs: (o = {}) => F.repeater('PREUVES', { fr: 'Preuves', en: 'Proof points' }, [
    F.choice('chips', 'type', { fr: 'Type', en: 'Type' }, PROOF_TYPES),
    F.textarea('texte', { fr: 'Preuve', en: 'Proof point' }, {
      required: true,
      placeholder: { fr: 'Ex. : −30 % de temps de planification chez Transports Martin (2025)', en: 'E.g. −30% scheduling time at Martin Logistics (2025)' }
    })
  ], {
    max: 10,
    help: { fr: 'Chiffres clients, témoignages, références, certifications. Sans preuve, l\'IA signalera où il en manque.', en: 'Client figures, testimonials, references, certifications. Without proof, the AI will flag where some is missing.' },
    addLabel: { fr: 'Ajouter une preuve', en: 'Add a proof point' },
    itemLabel: { fr: 'Preuve', en: 'Proof point' },
    ...o
  }),

  /** Rendu des preuves dans la section DONNÉES : « - [Témoignage] … ». */
  renderProofs: (rows, v, locale) => rows.map(r => `- [${labelOf(PROOF_TYPES, r.type, locale)}] ${r.texte.trim()}`).join('\n'),

  competitors: (o = {}) => F.tags('CONCURRENTS', { fr: 'Concurrents ou alternatives', en: 'Competitors or alternatives' }, {
    help: { fr: 'Ce que l\'interlocuteur pourrait choisir à la place, y compris « ne rien changer ».', en: 'What the contact might choose instead, including "change nothing".' },
    placeholder: { fr: 'Ex. : Excel', en: 'E.g. Excel' },
    ...o
  })
}
