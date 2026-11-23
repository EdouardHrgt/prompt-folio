/**
 * Moteur d'assemblage des prompts — JS pur, sans dépendance.
 *
 * Fonctions auto-importées par Nuxt (dossier app/utils) :
 *   localize(obj, locale)                         → texte dans la langue voulue
 *   getFormSteps(template)                        → étapes du formulaire et leurs champs
 *   getInitialValues(template, locale)            → valeurs par défaut de tous les champs
 *   isFieldVisible(field, values, item?)          → le champ doit-il être affiché ?
 *   createItem(field, rows, values)               → nouvel élément vide pour un répéteur / tableau
 *   validatePrompt(template, values, locale)      → liste des erreurs (vide = prêt à générer)
 *   buildPrompt(template, values, { locale })     → le prompt final (chaîne)
 *   promptStats(prompt)                           → { chars, words, tokens } (tokens estimés)
 *
 * Le prompt est « compilé » : seules les règles utiles aux choix de l'utilisateur sont
 * incluses (un seul format, un seul mode, sections sources / aperçu / exemple si besoin).
 */
import { buildCommonFields, FORMATS, MODES, NO_LENGTH_FORMATS, POSTURES, SOURCE_USAGES } from '../data/prompts/common.js'
import { BLOCKS, HEADINGS } from '../data/prompts/blocks.js'
import { getDomain } from '../data/prompts/index.js'

const MACHINE_FORMATS = ['CSV', 'JSON']

// ─── Helpers ────────────────────────────────────────────────────────────────

export function localize (obj, locale = 'fr') {
  if (obj == null) return ''
  if (typeof obj === 'string') return obj
  return obj[locale] ?? obj.fr ?? ''
}

function isEmpty (value) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

function when (fragment, values) {
  return typeof fragment.when === 'function' ? !!fragment.when(values) : true
}

function formatDate (iso, locale) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return locale === 'fr' ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

// ─── Champs ─────────────────────────────────────────────────────────────────

/** Étapes du formulaire, dans l'ordre d'affichage recommandé. */
export function getFormSteps (template) {
  const domain = getDomain(template.domain)
  const common = buildCommonFields(template, domain.roles)
  // Le contexte (seule étape vraiment à remplir) vient en premier ; les autres ont des valeurs par défaut.
  return [
    { id: 'contexte', label: { fr: 'Votre contexte', en: 'Your context' }, fields: template.fields },
    { id: 'role', label: { fr: 'Qui doit vous répondre ?', en: 'Who should answer you?' }, fields: common.role },
    { id: 'reponse', label: { fr: 'Votre réponse', en: 'Your answer' }, fields: common.reponse },
    { id: 'sources', label: { fr: 'Vos sources', en: 'Your sources' }, optional: true, fields: common.sources }
  ]
}

function allFields (template) {
  return getFormSteps(template).flatMap(s => s.fields)
}

export function getInitialValues (template, locale = 'fr') {
  const values = {}
  for (const field of allFields(template)) {
    values[field.key] = structuredClone(field.default ?? (['repeater', 'table', 'tags'].includes(field.type) ? [] : ''))
  }
  values.MODE = template.defaults.MODE
  if (values.LANGUE == null || values.LANGUE === '') values.LANGUE = locale
  return values
}

/** `item` est fourni pour les sous-champs d'un répéteur : showIf(item, values). */
export function isFieldVisible (field, values, item) {
  if (typeof field.showIf !== 'function') return true
  return item !== undefined ? !!field.showIf(item, values) : !!field.showIf(values)
}

function nextLetterId (rows) {
  const used = new Set(rows.map(r => r.id))
  for (let n = 0; n < 702; n++) {
    const id = n < 26 ? String.fromCharCode(65 + n) : String.fromCharCode(64 + Math.floor(n / 26)) + String.fromCharCode(65 + (n % 26))
    if (!used.has(id)) return id
  }
  return String(rows.length + 1)
}

export function createItem (field, rows = []) {
  const item = {}
  for (const sub of field.itemFields) {
    if (sub.auto === 'letter') item[sub.key] = nextLetterId(rows)
    else item[sub.key] = structuredClone(sub.default ?? '')
  }
  return item
}

// ─── Validation ─────────────────────────────────────────────────────────────

const MSG = {
  required: { fr: 'Ce champ est obligatoire.', en: 'This field is required.' },
  min: { fr: 'Ajoutez au moins {n} élément(s).', en: 'Add at least {n} item(s).' },
  duplicate: { fr: 'Identifiant en double : {id}.', en: 'Duplicate ID: {id}.' },
  unknownRef: { fr: 'La tâche {id} dépend d\'une tâche inexistante : {ref}.', en: 'Task {id} depends on a non-existent task: {ref}.' },
  selfRef: { fr: 'La tâche {id} ne peut pas dépendre d\'elle-même.', en: 'Task {id} cannot depend on itself.' },
  cycle: { fr: 'Dépendance circulaire : {path}.', en: 'Circular dependency: {path}.' }
}

const msg = (key, locale, vars = {}) =>
  localize(MSG[key], locale).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')

function findCycle (rows) {
  const graph = Object.fromEntries(rows.map(r => [r.id, r.predecesseurs || []]))
  const state = {}
  const stack = []
  const visit = id => {
    if (state[id] === 1) return [...stack.slice(stack.indexOf(id)), id]
    if (state[id] === 2 || !graph[id]) return null
    state[id] = 1
    stack.push(id)
    for (const p of graph[id]) {
      const c = visit(p)
      if (c) return c
    }
    stack.pop()
    state[id] = 2
    return null
  }
  for (const r of rows) {
    const c = visit(r.id)
    if (c) return c
  }
  return null
}

/** Renvoie [{ key, index?, itemKey?, message }] ; tableau vide = formulaire valide. */
export function validatePrompt (template, values, locale = 'fr') {
  const errors = []
  for (const field of allFields(template)) {
    if (!isFieldVisible(field, values)) continue
    const value = values[field.key]

    if (field.required && isEmpty(value)) {
      errors.push({ key: field.key, message: msg('required', locale) })
      continue
    }

    if (['repeater', 'table'].includes(field.type) && Array.isArray(value)) {
      if (field.min && value.length < field.min && (field.required || value.length > 0)) {
        errors.push({ key: field.key, message: msg('min', locale, { n: field.min }) })
      }
      value.forEach((item, index) => {
        for (const sub of field.itemFields) {
          if (!isFieldVisible(sub, values, item)) continue
          if (sub.required && isEmpty(item[sub.key])) {
            errors.push({ key: field.key, index, itemKey: sub.key, message: msg('required', locale) })
          }
        }
      })

      // Contrôles spécifiques aux réseaux de tâches (IDs + prédécesseurs).
      if (field.itemFields.some(s => s.optionsFrom === 'rows.id')) {
        const ids = value.map(r => r.id)
        ids.forEach((id, index) => {
          if (ids.indexOf(id) !== index) errors.push({ key: field.key, index, itemKey: 'id', message: msg('duplicate', locale, { id }) })
        })
        value.forEach((row, index) => {
          for (const ref of row.predecesseurs || []) {
            if (ref === row.id) errors.push({ key: field.key, index, itemKey: 'predecesseurs', message: msg('selfRef', locale, { id: row.id }) })
            else if (!ids.includes(ref)) errors.push({ key: field.key, index, itemKey: 'predecesseurs', message: msg('unknownRef', locale, { id: row.id, ref }) })
          }
        })
        const cycle = findCycle(value)
        if (cycle) errors.push({ key: field.key, message: msg('cycle', locale, { path: cycle.join(' → ') }) })
      }
    }
  }
  return errors
}

// ─── Assemblage ─────────────────────────────────────────────────────────────

function makeRenderer (template, values, locale) {
  const fields = Object.fromEntries(allFields(template).map(f => [f.key, f]))
  return key => {
    const value = values[key]
    if (isEmpty(value)) return ''
    const field = fields[key]
    if (field?.options) {
      const opt = field.options.find(o => o.value === value)
      if (opt) return localize(opt.prompt ?? opt.label, locale)
    }
    if (Array.isArray(value)) return value.join(', ')
    if (field?.type === 'date') return formatDate(value, locale)
    return String(value).trim()
  }
}

// Une valeur vide (champ obligatoire pas encore rempli) s'affiche « […] » dans l'aperçu.
function interpolate (text, render) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => render(key) || '[…]')
}

function fragments (list, values, locale, render) {
  return (list || [])
    .filter(f => when(f, values))
    .map(f => interpolate(localize(f, locale), render))
}

function section (headingKey, body, locale, suffix = '') {
  const content = Array.isArray(body) ? body.filter(Boolean).join('\n') : body
  if (!content) return ''
  return `### ${localize(HEADINGS[headingKey], locale)}${suffix}\n${content}`
}

function renderData (template, values, locale, render) {
  const sep = locale === 'fr' ? ' : ' : ': '
  const blocks = []
  for (const block of template.prompt.data || []) {
    const lines = []
    for (const item of block.items) {
      const raw = values[item.key]
      if (isEmpty(raw)) continue
      if (typeof item.render === 'function') {
        lines.push(item.render(raw, values, locale))
      } else {
        const text = render(item.key)
        const label = localize(item.label, locale)
        lines.push(text.includes('\n') ? `${label}${sep.trimEnd()}\n${text}` : `${label}${sep}${text}`)
      }
    }
    if (lines.length) {
      const tag = localize(block.tag, locale)
      blocks.push(`<${tag}>\n${lines.join('\n')}\n</${tag}>`)
    }
  }
  return blocks.join('\n\n')
}

function renderSources (sources, locale) {
  const fr = locale === 'fr'
  const lines = [localize(BLOCKS.sourcesIntro, locale)]
  sources.forEach((s, i) => {
    const n = i + 1
    const title = s.titre?.trim() || (fr ? 'Sans titre' : 'Untitled')
    const usage = localize(SOURCE_USAGES.find(u => u.value === s.usage)?.prompt, locale)
    const usageTxt = fr ? `usage : ${usage}` : `use as: ${usage}`
    const note = s.note?.trim() ? (fr ? ` — note : ${s.note.trim()}` : ` — note: ${s.note.trim()}`) : ''
    if (s.type === 'lien') {
      lines.push(`[${n}] ${title} — ${s.url?.trim()} — ${usageTxt}${note}`)
    } else if (s.type === 'document') {
      const file = fr ? `fichier joint « ${s.fichier?.trim()} »` : `attached file "${s.fichier?.trim()}"`
      lines.push(`[${n}] ${title} — ${file} — ${usageTxt}${note}`)
    } else {
      const provided = fr ? 'texte fourni ci-dessous' : 'text provided below'
      lines.push(`[${n}] ${title} — ${provided} — ${usageTxt}${note}`)
      lines.push(`<source_${n}>\n${s.texte?.trim()}\n</source_${n}>`)
    }
  })
  return lines.join('\n')
}

/**
 * Construit le prompt final.
 * @param {object} template  définition du template
 * @param {object} input     valeurs du formulaire (les valeurs manquantes prennent leur défaut)
 * @param {{locale?: 'fr'|'en'}} options  langue du prompt
 */
export function buildPrompt (template, input, { locale = 'fr' } = {}) {
  const domain = getDomain(template.domain)
  const values = { ...getInitialValues(template, locale), ...input }
  if (!template.modes.includes(values.MODE)) values.MODE = template.defaults.MODE
  if (!template.formats.includes(values.FORMAT)) values.FORMAT = template.defaults.FORMAT

  const render = makeRenderer(template, values, locale)
  const L = obj => interpolate(localize(obj, locale), render)
  const p = template.prompt
  const sources = (values.SOURCES || []).filter(s => !isEmpty(s.url) || !isEmpty(s.fichier) || !isEmpty(s.texte))
  const scope = values.INFOS || 'standard'
  const useSourceRules = sources.length > 0 || scope !== 'standard'
  const posture = POSTURES.find(o => o.value === values.POSTURE)

  const out = []

  // Rôle
  out.push(section('role', [
    L(domain.roles[values.ROLE]?.prompt ?? domain.roles[template.defaultRole].prompt),
    L(p.roleFocus),
    values.SECTEUR ? L(BLOCKS.sector) : '',
    values.ROLE_PRECISION ? L(BLOCKS.rolePrecision) : '',
    posture ? localize(posture.prompt, locale) : ''
  ], locale))

  // Contexte, données, sources
  out.push(section('context', fragments(p.context, values, locale, render), locale))
  out.push(section('data', renderData(template, values, locale, render), locale))
  if (sources.length) out.push(section('sources', renderSources(sources, locale), locale))

  // Tâche
  out.push(section('task', [
    values.PREVIEW ? localize(BLOCKS.previewStep, locale) : '',
    // Les étapes sont renumérotées : une étape conditionnelle masquée ne laisse pas de trou.
    ...fragments(p.task, values, locale, render).map((t, i) => `${i + 1}. ${t.replace(/^\d+\.\s*/, '')}`)
  ], locale))

  // Mode
  const modeLabel = localize(MODES.find(m => m.value === values.MODE)?.label, locale)
  out.push(section('mode', fragments(p.mode, values, locale, render), locale, locale === 'fr' ? ` : ${modeLabel}` : `: ${modeLabel}`))

  // Périmètre des informations et règles sur les sources
  if (useSourceRules) {
    const R = BLOCKS.sourcesRules
    const hasRemote = sources.some(s => s.type !== 'texte') || scope === 'web'
    out.push(section('sourcesRules', [
      { ferme: R.scopeClosed, standard: R.scopeStandard, web: R.scopeWeb }[scope],
      hasRemote ? R.unreadable : null,
      sources.length ? R.usages : null,
      sources.length ? (scope === 'ferme' ? R.priorityClosed : R.priority) : null,
      sources.length || scope === 'web' ? R.noInstructions : null,
      values.CITATIONS ? R.citations : null
    ].filter(Boolean).map(r => `- ${localize(r, locale)}`), locale))
  }

  // Format
  const formatLabel = localize(FORMATS[values.FORMAT]?.label, locale)
  out.push(section('format', [
    ...fragments(p.format, values, locale, render),
    !isEmpty(values.PUBLIC) ? L(BLOCKS.audience) : '',
    template.response?.longueur && !isEmpty(values.LONGUEUR) && !NO_LENGTH_FORMATS.includes(values.FORMAT) ? L(BLOCKS.length) : '',
    template.response?.tons && !isEmpty(values.TON) ? L(BLOCKS.tone) : '',
    L(BLOCKS.language)
  ], locale, locale === 'fr' ? ` : ${formatLabel}` : `: ${formatLabel}`))

  // Exemple
  if (!isEmpty(values.EXEMPLE)) {
    const tag = locale === 'fr' ? 'exemple' : 'example'
    out.push(section('example', [localize(BLOCKS.example, locale), `<${tag}>\n${values.EXEMPLE.trim()}\n</${tag}>`], locale))
  }

  // Contraintes
  out.push(section('constraints', [
    `- ${localize(BLOCKS.constraints[0], locale)}`,
    `- ${localize(MACHINE_FORMATS.includes(values.FORMAT) ? BLOCKS.constraintsMachine : BLOCKS.constraints[1], locale)}`,
    ...fragments(p.constraints, values, locale, render)
  ], locale))

  // Aperçu
  if (values.PREVIEW) out.push(section('preview', BLOCKS.preview.map(b => localize(b, locale)), locale))

  // Contrôle qualité
  out.push(section('quality', [
    ...fragments(p.quality, values, locale, render),
    scope === 'ferme' ? localize(BLOCKS.quality.closed, locale) : '',
    sources.length || scope === 'web' ? localize(BLOCKS.quality.sources, locale) : '',
    values.PREVIEW ? localize(BLOCKS.quality.preview, locale) : ''
  ], locale))

  return out.filter(Boolean).join('\n\n')
}

/** Statistiques simples ; tokens ≈ caractères / 4 (ordre de grandeur, varie selon le modèle). */
export function promptStats (prompt) {
  return {
    chars: prompt.length,
    words: prompt.trim() ? prompt.trim().split(/\s+/).length : 0,
    tokens: Math.ceil(prompt.length / 4)
  }
}
