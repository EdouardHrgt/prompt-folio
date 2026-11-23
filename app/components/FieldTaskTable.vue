<script setup>
/**
 * Tableau éditable de tâches (GP-02) :
 * - ID automatique (A, B, C…), modifiable ; renommer un ID met à jour les dépendances ;
 * - prédécesseurs choisis parmi les autres lignes (pas de référence invalide possible) ;
 * - import d'un CSV collé.
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
  values: { type: Object, required: true },
  errors: { type: Array, default: () => [] },
  showErrors: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const { t, l } = useLocale()

const rows = computed(() => props.modelValue || [])
const predField = computed(() => props.field.itemFields.find(f => f.optionsFrom === 'rows.id'))
const columns = computed(() => props.field.itemFields.filter(f => f !== predField.value && isFieldVisible(f, props.values, {})))
const canAdd = computed(() => !props.field.max || rows.value.length < props.field.max)

const toNumber = raw => (raw === '' ? null : Number(raw))

function setCell (index, key, value) {
  const oldId = rows.value[index].id
  let next = rows.value.map((r, i) => (i === index ? { ...r, [key]: value } : r))
  if (key === 'id' && oldId && value) {
    next = next.map(r => ({ ...r, predecesseurs: (r.predecesseurs || []).map(p => (p === oldId ? value : p)) }))
  }
  emit('update:modelValue', next)
}

function togglePred (index, id) {
  const current = rows.value[index].predecesseurs || []
  setCell(index, 'predecesseurs', current.includes(id) ? current.filter(p => p !== id) : [...current, id])
}

const add = () => emit('update:modelValue', [...rows.value, createItem(props.field, rows.value)])

function remove (index) {
  const removedId = rows.value[index].id
  emit('update:modelValue', rows.value
    .filter((_, i) => i !== index)
    .map(r => ({ ...r, predecesseurs: (r.predecesseurs || []).filter(p => p !== removedId) })))
}

const cellError = (index, key) => props.showErrors && props.errors.some(e => e.index === index && e.itemKey === key)
const tableErrors = computed(() => {
  if (!props.showErrors) return []
  return [...new Set(props.errors.filter(e => e.index != null || e.itemKey).map(e => e.message))]
})

// ─── Import CSV ───
const csv = ref('')
const importMessage = ref('')
function importCsv () {
  const result = parseTasksCsv(csv.value)
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
            <th v-for="col in columns" :key="col.key" scope="col">{{ l(col.label) }}</th>
            <th scope="col">{{ l(predField?.label) }}</th>
            <th scope="col"><span class="sr-only">{{ t('form.remove') }}</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.key === 'id' ? 'col-id' : (col.type === 'number' ? 'col-number' : 'col-title')"
            >
              <input
                :type="col.type === 'number' ? 'number' : 'text'"
                :min="col.min"
                :value="row[col.key]"
                :aria-label="`${l(col.label)} — ${row.id || index + 1}`"
                :class="{ 'is-invalid': cellError(index, col.key) }"
                @input="setCell(index, col.key, col.type === 'number' ? toNumber($event.target.value) : $event.target.value)"
              >
            </td>
            <td>
              <div class="pred-list" role="group" :aria-label="`${t('table.predecessors')} — ${row.id}`">
                <label
                  v-for="other in rows.filter((_, j) => j !== index && _.id)"
                  :key="other.id"
                  class="chip-toggle"
                  :class="{ 'is-selected': (row.predecesseurs || []).includes(other.id), 'is-invalid': cellError(index, 'predecesseurs') }"
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    :checked="(row.predecesseurs || []).includes(other.id)"
                    @change="togglePred(index, other.id)"
                  >
                  {{ other.id }}
                </label>
                <span v-if="rows.length < 2" class="muted small">{{ t('table.none') }}</span>
              </div>
            </td>
            <td>
              <button type="button" class="btn btn-small" :aria-label="`${t('form.remove')} ${row.id}`" @click="remove(index)">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-for="message in tableErrors" :key="message" class="field-error" role="alert">{{ message }}</p>

    <div class="table-actions">
      <button v-if="canAdd" type="button" class="btn" @click="add">+ {{ l(field.addLabel) || t('form.add') }}</button>
    </div>

    <details v-if="field.import" class="advanced">
      <summary>{{ t('table.import') }}</summary>
      <p class="field-help">{{ t('table.importHelp') }}</p>
      <textarea v-model="csv" rows="5" :aria-label="t('table.import')" />
      <div class="table-actions">
        <button type="button" class="btn" :disabled="!csv.trim()" @click="importCsv">{{ t('table.importButton') }}</button>
        <span v-if="importMessage" class="small" role="status">{{ importMessage }}</span>
      </div>
    </details>
  </div>
</template>
