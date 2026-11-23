import { FIELD_GROUPS } from '~/data/prompts/common.js'

const CHOICE_TYPES = ['chips', 'segmented', 'cards', 'select', 'combobox']

const isEmpty = v => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)

/**
 * État et logique du formulaire d'un template : valeurs, sections, erreurs, prompt.
 * Le brouillon est sauvegardé en localStorage (par template et par version).
 */
export function usePromptForm (template) {
  const { locale, t, l } = useLocale()

  const values = reactive(getInitialValues(template, locale.value))
  const attempted = ref(false) // passe à true quand l'utilisateur veut copier : on affiche alors les erreurs
  const steps = getFormSteps(template)
  const allFields = steps.flatMap(s => s.fields)
  const stepByKey = Object.fromEntries(steps.flatMap(s => s.fields.map(f => [f.key, s.id])))

  const errors = computed(() => validatePrompt(template, values, locale.value))
  const prompt = computed(() => buildPrompt(template, values, { locale: locale.value }))
  const stats = computed(() => promptStats(prompt.value))
  const hasAttachments = computed(() => (values.SOURCES || []).some(s => s.type === 'document'))

  // La langue de réponse suit la langue de l'interface tant que l'utilisateur ne l'a pas changée.
  watch(locale, (next, prev) => { if (values.LANGUE === prev) values.LANGUE = next })

  // ─── Brouillon ───
  const draftKey = `pf-draft-${template.id}`
  onMounted(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null')
      if (saved?.version === template.version) {
        for (const key of Object.keys(values)) if (key in saved.values) values[key] = saved.values[key]
      }
    } catch {}
    watch(values, () => {
      try { localStorage.setItem(draftKey, JSON.stringify({ version: template.version, values })) } catch {}
    }, { deep: true })
  })

  function reset () {
    Object.assign(values, getInitialValues(template, locale.value))
    attempted.value = false
    try { localStorage.removeItem(draftKey) } catch {}
  }

  // ─── Affichage des sections ───
  const visibleFields = step => step.fields.filter(f => isFieldVisible(f, values))

  /** Regroupe les champs visibles d'une section : groupes (fieldset), champs simples, puis champs avancés. */
  function blocks (step) {
    const out = []
    const advanced = []
    for (const field of visibleFields(step)) {
      if (field.advanced) { advanced.push(field); continue }
      const last = out[out.length - 1]
      if (field.group && last?.group === field.group) last.fields.push(field)
      else if (field.group) out.push({ key: `group-${field.group}`, group: field.group, label: FIELD_GROUPS[field.group] ?? { fr: field.group, en: field.group }, fields: [field] })
      else out.push({ key: field.key, fields: [field] })
    }
    if (advanced.length) out.push({ key: 'advanced', advanced: true, fields: advanced })
    return out
  }

  const stepErrors = step => errors.value.filter(e => stepByKey[e.key] === step.id)

  function optionLabel (field, value) {
    if (field.type === 'toggle') return value ? l(field.label) : ''
    const opt = field.options?.find(o => o.value === value)
    return opt ? l(opt.label) : (typeof value === 'string' ? value : '')
  }

  /** Résumé affiché quand la section est repliée. */
  function summary (step) {
    if (step.id === 'contexte') {
      const fields = visibleFields(step)
      const filled = fields.filter(f => !isEmpty(values[f.key])).length
      return t('summary.filled', { n: filled, total: fields.length })
    }
    if (step.id === 'sources') {
      const n = (values.SOURCES || []).length
      return n ? t('summary.sources', { n }) : t('summary.noSources')
    }
    const parts = visibleFields(step)
      .filter(f => CHOICE_TYPES.includes(f.type) && !isEmpty(values[f.key]))
      .map(f => optionLabel(f, values[f.key]))
    if (step.id === 'reponse' && values.PREVIEW) parts.push(t('summary.preview'))
    return parts.filter(Boolean).join(' · ')
  }

  const initial = getInitialValues(template, locale.value)

  /** Statut affiché dans l'en-tête de section : { type: todo|done|default|custom|optional, text }. */
  function status (step) {
    const n = new Set(stepErrors(step).map(e => `${e.key}-${e.index ?? ''}`)).size
    if (n) return { type: 'todo', text: t('status.toFill', { n }) }
    if (step.id === 'contexte') return { type: 'done', text: '✓ ' + t('status.done') }
    const changed = step.fields.some(f => f.key !== 'LANGUE' && JSON.stringify(values[f.key]) !== JSON.stringify(initial[f.key]))
    if (!changed) return step.optional ? { type: 'optional', text: t('status.optional') } : { type: 'default', text: t('status.default') }
    return { type: 'custom', text: '✓ ' + t('status.custom') }
  }

  // ─── Erreurs ───
  const fieldErrors = key => errors.value.filter(e => e.key === key)

  /** Liste des éléments manquants, avec un libellé lisible (« Tâches · n°2 · Durée »). */
  const missing = computed(() => {
    const seen = new Set()
    return errors.value.filter(e => {
      const id = `${e.key}-${e.index ?? ''}-${e.itemKey ?? ''}`
      if (seen.has(id)) return false
      seen.add(id)
      return true
    }).map(e => {
      const field = allFields.find(f => f.key === e.key)
      const parts = [l(field?.label)]
      if (e.index != null) parts.push(`n°${e.index + 1}`)
      if (e.itemKey) parts.push(l(field?.itemFields?.find(s => s.key === e.itemKey)?.label))
      return { ...e, step: stepByKey[e.key], label: parts.filter(Boolean).join(' · ') }
    })
  })

  return { values, steps, blocks, summary, status, errors, fieldErrors, missing, attempted, prompt, stats, hasAttachments, reset }
}
