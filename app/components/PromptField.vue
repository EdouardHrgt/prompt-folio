<script setup>
/**
 * Affiche un champ selon son type (voir docs/templates-schema.md).
 * Les types composés délèguent à FieldChoice, FieldCombobox, FieldTags, FieldRepeater, FieldTaskTable.
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: null, default: null },
  values: { type: Object, required: true },     // toutes les valeurs (conditions d'affichage)
  errors: { type: Array, default: () => [] },   // erreurs de ce champ (validatePrompt)
  showErrors: { type: Boolean, default: false },
  idPrefix: { type: String, default: 'field' }
})
const emit = defineEmits(['update:modelValue'])
const { t, l } = useLocale()

const id = computed(() => `${props.idPrefix}-${props.field.key}`)
const inputId = computed(() => `${id.value}-input`)
const type = computed(() => props.field.type)
const isGroupControl = computed(() => ['chips', 'segmented', 'cards', 'repeater', 'table', 'tags'].includes(type.value))

// Erreur propre au champ (les erreurs de lignes sont affichées par le répéteur / tableau).
const ownError = computed(() => props.showErrors ? props.errors.find(e => e.index == null && !e.itemKey)?.message : null)

const update = value => emit('update:modelValue', value)
const toNumber = raw => (raw === '' ? null : Number(raw))

const sliderLabel = computed(() => {
  const mark = props.field.marks?.[props.modelValue]
  return mark ? `${props.modelValue} — ${l(mark)}` : String(props.modelValue ?? '')
})
</script>

<template>
  <div :id="id" class="field" :class="[`field--${type}`, { 'has-error': ownError }]">
    <!-- Interrupteur : le libellé est dans le contrôle -->
    <label v-if="type === 'toggle'" class="toggle">
      <input type="checkbox" :checked="!!modelValue" @change="update($event.target.checked)">
      <span>{{ l(field.label) }}</span>
    </label>

    <template v-else>
      <component
        :is="isGroupControl ? 'span' : 'label'"
        :id="`${id}-label`"
        class="field-label"
        :for="isGroupControl ? undefined : inputId"
      >
        {{ l(field.label) }}<span v-if="field.required" class="req" :title="t('form.required')">*</span>
      </component>
      <p v-if="field.help" :id="`${id}-help`" class="field-help">{{ l(field.help) }}</p>

      <input
        v-if="type === 'text'"
        :id="inputId"
        type="text"
        :value="modelValue"
        :placeholder="l(field.placeholder)"
        @input="update($event.target.value)"
      >
      <textarea
        v-else-if="type === 'textarea'"
        :id="inputId"
        :value="modelValue"
        :placeholder="l(field.placeholder)"
        rows="3"
        @input="update($event.target.value)"
      />
      <input
        v-else-if="type === 'number'"
        :id="inputId"
        type="number"
        :min="field.min"
        :max="field.max"
        :value="modelValue"
        @input="update(toNumber($event.target.value))"
      >
      <input
        v-else-if="type === 'date'"
        :id="inputId"
        type="date"
        :value="modelValue"
        @input="update($event.target.value)"
      >
      <select
        v-else-if="type === 'select'"
        :id="inputId"
        :value="modelValue"
        @change="update($event.target.value)"
      >
        <option v-for="o in field.options" :key="o.value" :value="o.value">{{ l(o.label) }}</option>
      </select>
      <div v-else-if="type === 'slider'" class="slider-row">
        <input
          :id="inputId"
          type="range"
          :min="field.min"
          :max="field.max"
          step="1"
          :value="modelValue"
          @input="update(Number($event.target.value))"
        >
        <output :for="inputId">{{ sliderLabel }}</output>
      </div>
      <FieldCombobox
        v-else-if="type === 'combobox'"
        :input-id="inputId"
        :field="field"
        :model-value="modelValue"
        @update:model-value="update"
      />
      <FieldChoice
        v-else-if="['chips', 'segmented', 'cards'].includes(type)"
        :name="inputId"
        :labelled-by="`${id}-label`"
        :variant="type"
        :field="field"
        :model-value="modelValue"
        @update:model-value="update"
      />
      <FieldTags
        v-else-if="type === 'tags'"
        :input-id="inputId"
        :model-value="modelValue"
        @update:model-value="update"
      />
      <FieldRepeater
        v-else-if="type === 'repeater'"
        :field="field"
        :model-value="modelValue"
        :values="values"
        :errors="errors"
        :show-errors="showErrors"
        :id-prefix="id"
        @update:model-value="update"
      />
      <FieldTaskTable
        v-else-if="type === 'table'"
        :field="field"
        :model-value="modelValue"
        :values="values"
        :errors="errors"
        :show-errors="showErrors"
        @update:model-value="update"
      />
    </template>

    <p v-if="type === 'toggle' && field.help" class="field-help">{{ l(field.help) }}</p>
    <p v-if="ownError" class="field-error" role="alert">{{ ownError }}</p>
  </div>
</template>
