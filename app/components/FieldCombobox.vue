<script setup>
/**
 * Liste de suggestions + saisie libre (datalist natif).
 * Si le texte correspond à une option, on stocke sa `value` (traduisible) ; sinon le texte saisi.
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: null, default: '' },
  inputId: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
const { l } = useLocale()

const display = computed(() => {
  const opt = props.field.options?.find(o => o.value === props.modelValue)
  return opt ? l(opt.label) : (props.modelValue ?? '')
})

function onInput (event) {
  const text = event.target.value
  const opt = props.field.options?.find(o => l(o.label).toLowerCase() === text.trim().toLowerCase())
  emit('update:modelValue', opt ? opt.value : text)
}
</script>

<template>
  <input
    :id="inputId"
    type="text"
    :list="`${inputId}-list`"
    :value="display"
    :placeholder="l(field.placeholder)"
    autocomplete="off"
    @input="onInput"
  >
  <datalist :id="`${inputId}-list`">
    <option v-for="o in field.options" :key="o.value" :value="l(o.label)" />
  </datalist>
</template>
