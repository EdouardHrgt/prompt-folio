<script setup>
/**
 * Choix sous forme de pastilles (chips), boutons groupés (segmented) ou cartes (cards).
 * `multiple` : plusieurs choix possibles, la valeur est alors une liste (type de champ 'multichips').
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: null, default: null },
  variant: { type: String, default: 'chips' },
  name: { type: String, required: true },
  labelledBy: { type: String, default: undefined },
  multiple: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const { t, l } = useLocale()

const isSelected = value => (props.multiple ? (props.modelValue || []).includes(value) : props.modelValue === value)

function select (value) {
  if (!props.multiple) return emit('update:modelValue', value)
  const next = new Set(props.modelValue || [])
  next.has(value) ? next.delete(value) : next.add(value)
  // Ordre des options conservé, quel que soit l'ordre des clics.
  emit('update:modelValue', props.field.options.map(o => o.value).filter(v => next.has(v)))
}
</script>

<template>
  <div class="choice" :class="`choice--${variant}`" :role="multiple ? 'group' : 'radiogroup'" :aria-labelledby="labelledBy">
    <label
      v-for="o in field.options"
      :key="o.value"
      class="choice-item"
      :class="{ 'is-selected': isSelected(o.value) }"
      :title="variant !== 'cards' && o.hint ? l(o.hint) : undefined"
    >
      <input
        :type="multiple ? 'checkbox' : 'radio'"
        class="sr-only"
        :name="name"
        :value="o.value"
        :checked="isSelected(o.value)"
        @change="select(o.value)"
      >
      <span class="choice-label">
        {{ l(o.label) }}<span v-if="o.recommended" class="badge">{{ t('form.recommended') }}</span>
      </span>
      <span v-if="variant === 'cards' && o.hint" class="choice-hint">{{ l(o.hint) }}</span>
    </label>
  </div>
</template>
