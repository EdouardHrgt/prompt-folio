<script setup>
/** Blocs répétables (sources, indicateurs, retours…) : ajouter, supprimer. */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
  values: { type: Object, required: true },
  errors: { type: Array, default: () => [] },
  showErrors: { type: Boolean, default: false },
  idPrefix: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
const { t, l } = useLocale()

const items = computed(() => props.modelValue || [])
const canAdd = computed(() => !props.field.max || items.value.length < props.field.max)

const setItem = (index, key, value) =>
  emit('update:modelValue', items.value.map((it, i) => (i === index ? { ...it, [key]: value } : it)))
const add = () => emit('update:modelValue', [...items.value, createItem(props.field, items.value)])
const remove = index => emit('update:modelValue', items.value.filter((_, i) => i !== index))

const visible = (sub, item) => isFieldVisible(sub, props.values, item)

// Erreurs d'un sous-champ, transmises sans index pour que PromptField les affiche.
const itemErrors = (index, key) =>
  props.errors.filter(e => e.index === index && e.itemKey === key).map(e => ({ message: e.message }))
</script>

<template>
  <div class="repeater">
    <ol v-if="items.length" class="repeater-list">
      <li v-for="(item, index) in items" :key="index" class="repeater-item">
        <div class="repeater-item-head">
          <span>{{ field.itemLabel ? `${l(field.itemLabel)} ${index + 1}` : t('form.item', { n: index + 1 }) }}</span>
          <button type="button" class="btn btn-small" @click="remove(index)">{{ t('form.remove') }}</button>
        </div>

        <template v-for="sub in field.itemFields" :key="sub.key">
          <PromptField
            v-if="visible(sub, item)"
            :field="sub"
            :model-value="item[sub.key]"
            :values="values"
            :errors="itemErrors(index, sub.key)"
            :show-errors="showErrors"
            :id-prefix="`${idPrefix}-${index}`"
            @update:model-value="value => setItem(index, sub.key, value)"
          />
        </template>
      </li>
    </ol>

    <button v-if="canAdd" type="button" class="btn" @click="add">+ {{ l(field.addLabel) || t('form.add') }}</button>
  </div>
</template>
