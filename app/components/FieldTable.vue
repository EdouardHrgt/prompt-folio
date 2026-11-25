<script setup>
/**
 * Tableau éditable générique (type 'table').
 * - Colonne identifiant : le sous-champ `auto: 'letter'` (A, B, C… générés, modifiables).
 * - Colonne de références (optionnelle) : le sous-champ `optionsFrom: 'rows.<id>'`,
 *   choisie parmi les autres lignes ; renommer ou supprimer une ligne met les références à jour.
 * - Import (optionnel) : `field.import = { parser, help }`, parser déclaré dans PARSERS.
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
  values: { type: Object, required: true },
  errors: { type: Array, default: () => [] },
  showErrors: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const { t, l, locale } = useLocale()

// Analyseurs d'import disponibles (clé = field.import.parser).
const PARSERS = { tasks: parseTasksCsv }

const rows = computed(() => props.modelValue || [])
const refs = computed(() => getRefField(props.field)) // { idKey, refKey, refField } ou undefined
const idKey = computed(() => props.field.itemFields.find(f => f.auto)?.key ?? refs.value?.idKey ?? 'id')
const refKey = computed(() => refs.value?.refKey)
const columns = computed(() => props.field.itemFields.filter(f => f.key !== refKey.value && isFieldVisible(f, props.values, {})))
const canAdd = computed(() => !props.field.max || rows.value.length < props.field.max)
// Total imposé d'une colonne (`field.sum`), affiché en direct sous le tableau.
const total = computed(() => columnTotal(props.field, rows.value))
const totalOk = computed(() => total.value === props.field.sum?.equals)

const toNumber = raw => (raw === '' ? null : Number(raw))
const colClass = col => (col.auto ? 'col-id' : col.type === 'number' ? 'col-number' : 'col-title')
const refsOf = row => (refKey.value ? row[refKey.value] || [] : [])

function setCell (index, key, value) {
  const oldId = rows.value[index][idKey.value]
  let next = rows.value.map((r, i) => (i === index ? { ...r, [key]: value } : r))
  // Renommer un identifiant met à jour les lignes qui le référencent.
  if (key === idKey.value && refKey.value && oldId && value) {
    next = next.map(r => ({ ...r, [refKey.value]: refsOf(r).map(p => (p === oldId ? value : p)) }))
  }
  emit('update:modelValue', next)
}

function toggleRef (index, id) {
  const current = refsOf(rows.value[index])
  setCell(index, refKey.value, current.includes(id) ? current.filter(p => p !== id) : [...current, id])
}

const add = () => emit('update:modelValue', [...rows.value, createItem(props.field, rows.value)])

// Lignes type (`field.preset(values)`), proposées tant que le tableau est vide.
const canPreset = computed(() => !rows.value.length && typeof props.field.preset === 'function')
const applyPreset = () => emit('update:modelValue', structuredClone(props.field.preset(props.values, locale.value)))

function remove (index) {
  const removedId = rows.value[index][idKey.value]
  emit('update:modelValue', rows.value
    .filter((_, i) => i !== index)
    .map(r => (refKey.value ? { ...r, [refKey.value]: refsOf(r).filter(p => p !== removedId) } : r)))
}

const cellError = (index, key) => props.showErrors && props.errors.some(e => e.index === index && e.itemKey === key)
const rowErrors = computed(() => {
  if (!props.showErrors) return []
  return [...new Set(props.errors.filter(e => e.index != null || e.itemKey).map(e => e.message))]
})

// ─── Import ───
const csv = ref('')
const importMessage = ref('')
function importRows () {
  const parse = PARSERS[props.field.import?.parser]
  const result = parse ? parse(csv.value) : { error: 'parser' }
  if (result.error) {
    importMessage.value = t('table.importError')
    return
  }
  emit('update:modelValue', result.rows)
  importMessage.value = t('table.imported', { n: result.rows.length })
  csv.value = ''
}
</script>

<template>
  <div class="task-table-field">
    <div v-if="rows.length" class="table-wrap">
      <table class="task-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" scope="col">{{ l(fieldText(col.label, values)) }}</th>
            <th v-if="refs" scope="col">{{ l(refs.refField.label) }}</th>
            <th scope="col"><span class="sr-only">{{ t('form.remove') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td v-for="col in columns" :key="col.key" :class="colClass(col)">
              <input
                :type="col.type === 'number' ? 'number' : 'text'"
                :min="col.min"
                :value="row[col.key]"
                :aria-label="`${l(col.label)} — ${row[idKey] || index + 1}`"
                :class="{ 'is-invalid': cellError(index, col.key) }"
                @input="setCell(index, col.key, col.type === 'number' ? toNumber($event.target.value) : $event.target.value)"
              >
            </td>
            <td v-if="refs">
              <div class="pred-list" role="group" :aria-label="`${l(refs.refField.label)} — ${row[idKey]}`">
                <label
                  v-for="other in rows.filter((r, j) => j !== index && r[idKey])"
                  :key="other[idKey]"
                  class="chip-toggle"
                  :class="{ 'is-selected': refsOf(row).includes(other[idKey]), 'is-invalid': cellError(index, refKey) }"
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    :checked="refsOf(row).includes(other[idKey])"
                    @change="toggleRef(index, other[idKey])"
                  >
                  {{ other[idKey] }}
                </label>
                <span v-if="rows.length < 2" class="muted small">{{ t('table.none') }}</span>
              </div>
            </td>
            <td>
              <button type="button" class="btn btn-small" :aria-label="`${t('form.remove')} ${row[idKey] ?? ''}`" @click="remove(index)">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="field.sum && rows.length" class="small table-total" :class="totalOk ? 'muted' : 'field-error'" role="status">
      {{ t('table.total', { total: total ?? 0, n: field.sum.equals }) }}
    </p>

    <p v-for="message in rowErrors" :key="message" class="field-error" role="alert">{{ message }}</p>

    <div class="table-actions">
      <button v-if="canAdd" type="button" class="btn" @click="add">+ {{ l(field.addLabel) || t('form.add') }}</button>
      <button v-if="canPreset" type="button" class="btn btn-ghost" @click="applyPreset">{{ l(fieldText(field.presetLabel, values)) || t('table.preset') }}</button>
    </div>

    <details v-if="field.import" class="advanced">
      <summary>{{ t('table.import') }}</summary>
      <p v-if="field.import.help" class="field-help">{{ l(field.import.help) }}</p>
      <textarea v-model="csv" rows="5" :aria-label="t('table.import')" />
      <div class="table-actions">
        <button type="button" class="btn" :disabled="!csv.trim()" @click="importRows">{{ t('table.importButton') }}</button>
        <span v-if="importMessage" class="small" role="status">{{ importMessage }}</span>
      </div>
    </details>
  </div>
</template>
