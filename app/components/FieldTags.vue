<script setup>
/** Saisie d'étiquettes : Entrée (ou virgule) pour ajouter, × pour retirer. */
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  inputId: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
const { t } = useLocale()
const draft = ref('')

function add () {
  const value = draft.value.trim().replace(/,$/, '')
  if (value && !props.modelValue.includes(value)) emit('update:modelValue', [...props.modelValue, value])
  draft.value = ''
}
function onKeydown (event) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    add()
  }
}
const remove = value => emit('update:modelValue', props.modelValue.filter(v => v !== value))
</script>

<template>
  <div class="tags">
    <span v-for="tag in modelValue" :key="tag" class="tag">
      {{ tag }}
      <button type="button" class="btn-link" :aria-label="`${t('form.remove')} ${tag}`" @click="remove(tag)">×</button>
    </span>
  </div>
  <input
    :id="inputId"
    v-model="draft"
    type="text"
    :placeholder="t('form.tagsPlaceholder')"
    @keydown="onKeydown"
    @blur="add"
  >
</template>
