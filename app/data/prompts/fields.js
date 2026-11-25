/**
 * Fabriques de champs génériques (niveau 1 de la bibliothèque de champs).
 *
 *   F.text('BUDGET', { fr: 'Budget', en: 'Budget' }, { placeholder: … })
 *
 * Chaque fabrique renvoie un champ complet avec des valeurs par défaut saines
 * (facultatif, vide) ; le 3e argument surcharge n'importe quelle propriété.
 *
 * Niveaux de la bibliothèque :
 *   1. ici                        → types de champs génériques
 *   2. <domaine>/fields.js        → champs métier partagés par les tâches d'un domaine
 *   3. dans chaque template       → champs propres à une seule tâche
 *
 * Propriété utile pour le prompt : `promptLabel` = libellé utilisé dans la section DONNÉES
 * du prompt quand il doit différer du libellé affiché (ex. « Objectif du projet » → « Objectif »).
 */

const field = (type, empty) => (key, label, options = {}) => ({
  key,
  type,
  required: false,
  default: empty,
  label,
  ...options
})

export const F = {
  text: field('text', ''),
  textarea: field('textarea', ''),
  date: field('date', ''),
  number: field('number', null),
  toggle: field('toggle', false),
  combobox: field('combobox', ''),
  tags: field('tags', []),

  /** Choix multiple en pastilles (valeur = liste). */
  multichoice: (key, label, options, extra = {}) => ({
    key,
    type: 'multichips',
    required: false,
    default: [],
    label,
    options,
    ...extra
  }),

  /** Choix unique. `type` : 'segmented' | 'chips' | 'cards' | 'select'. Défaut = 1re option. */
  choice: (type, key, label, options, extra = {}) => ({
    key,
    type,
    required: true,
    default: options[0].value,
    label,
    options,
    ...extra
  }),

  slider: (key, label, { min, max, default: dflt }, extra = {}) => ({
    key,
    type: 'slider',
    required: true,
    default: dflt,
    min,
    max,
    label,
    ...extra
  }),

  /** Blocs répétables (un sous-formulaire par élément). */
  repeater: (key, label, itemFields, extra = {}) => ({
    key,
    type: 'repeater',
    required: false,
    default: [],
    label,
    itemFields,
    ...extra
  }),

  /**
   * Tableau éditable avec références entre lignes.
   * Un sous-champ `auto: 'letter'` sert d'identifiant ; un sous-champ `optionsFrom: 'rows.<id>'`
   * fait référence à d'autres lignes (ex. prédécesseurs). Le moteur valide doublons,
   * références inexistantes et boucles.
   */
  table: (key, label, itemFields, extra = {}) => ({
    key,
    type: 'table',
    required: false,
    default: [],
    label,
    itemFields,
    ...extra
  })
}
