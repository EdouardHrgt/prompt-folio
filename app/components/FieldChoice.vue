<script setup>
/** Choix unique sous forme de pastilles (chips), boutons groupés (segmented) ou cartes (cards). */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: null, default: null },
  variant: { type: String, default: 'chips' },
  name: { type: String, required: true },
  labelledBy: { type: String, default: undefined }
})
const emit = defineEmits(['update:modelValue'])
const { t, l } = useLocale()
</script>

<template>
  <div class="choice" :class="`choice--${variant}`" role="radiogroup" :aria-labelledby="labelledBy">
    <label
      v-for="o in field.options"
      :key="o.value"
      class="choice-item"
      :class="{ 'is-selected': modelValue === o.value }"
      :title="variant !== 'cards' && o.hint ? l(o.hint) : undefined"
    >
      <input
        type="radio"
        class="sr-only"
        :name="name"
        :value="o.value"
        :checked="modelValue === o.value"
        @change="emit('update:modelValue', o.value)"
      >
      <span class="choice-label">
        {{ l(o.label) }}<span v-if="o.recommended" class="badge">{{ t('form.recommended') }}</span>
      </span>
      <span v-if="variant === 'cards' && o.hint" class="choice-hint">{{ l(o.hint) }}</span>
    </label>
  </div>
</template>
