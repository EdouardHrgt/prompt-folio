/**
 * Aides pour écrire les textes de prompt des templates.
 *
 * Conditions (pour `when` d'un fragment ou `showIf` d'un champ) :
 *   formatIs('CSV', 'JSON'), formatIsNot('JSON'), modeIs('FACTUEL'), modeIsNot('FACTUEL'),
 *   filled('ECHEANCE'), missing('EQUIPE'), is('GRANULARITE', 'macro'), isNot('GRANULARITE', 'macro'), all(c1, c2),
 *   has('OBJECTIFS', 'raccourcir'), hasNot('OBJECTIFS', 'ton')   (choix multiple)
 *
 * Fragments de format réutilisables :
 *   jsonFormat(schema)          → « Uniquement du JSON valide… conforme à ce schéma : … »
 *   csvFormat(headers, note?)   → « Uniquement du CSV… Séparateur « ; », en-têtes : … »
 *   strictFormatCheck(formats)  → ligne de contrôle qualité « format respecté à la lettre »
 */

// ─── Conditions ───
export const formatIs = (...formats) => v => formats.includes(v.FORMAT)
export const formatIsNot = (...formats) => v => !formats.includes(v.FORMAT)
export const modeIs = (...modes) => v => modes.includes(v.MODE)
export const modeIsNot = (...modes) => v => !modes.includes(v.MODE)
export const is = (key, ...values) => v => values.includes(v[key])
export const isNot = (key, ...values) => v => !values.includes(v[key])
// Vide = null, chaîne blanche ou liste vide (étiquettes, répéteurs).
const isBlank = value => value == null || value === false || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length)
export const filled = key => v => !isBlank(v[key])
export const missing = key => v => isBlank(v[key])
export const all = (...conditions) => v => conditions.every(c => c(v))
/** Choix multiple : la valeur `value` est cochée dans `key`. */
export const has = (key, value) => v => Array.isArray(v[key]) && v[key].includes(value)
export const hasNot = (key, value) => v => !has(key, value)(v)

// ─── Formats ───
/** @param {{fr: string, en: string}} schema  schéma JSON (les clés peuvent différer entre FR et EN) */
export const jsonFormat = (schema, when = formatIs('JSON')) => ({
  fr: `Uniquement du JSON valide, sans texte avant ou après, conforme à ce schéma :\n${schema.fr}`,
  en: `Valid JSON only, with no text before or after, following this schema:\n${schema.en}`,
  when
})

/** @param {{fr: string, en: string}} headers  ligne d'en-têtes ; `note` = précision ajoutée après */
export const csvFormat = (headers, note, when = formatIs('CSV')) => ({
  fr: `Uniquement du CSV, sans aucun texte avant ou après. Séparateur « ; », en-têtes :\n${headers.fr}${note ? `\n${note.fr}` : ''}`,
  en: `CSV only, with no text before or after. Separator ";", headers:\n${headers.en}${note ? `\n${note.en}` : ''}`,
  when
})

export const strictFormatCheck = (formats = ['CSV', 'JSON']) => ({
  fr: '- [ ] Le format est respecté à la lettre, sans texte parasite.',
  en: '- [ ] The format is followed exactly, with no extra text.',
  when: formatIs(...formats)
})
