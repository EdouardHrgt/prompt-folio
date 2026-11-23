<script setup>
/** Section repliable du formulaire, avec statut et résumé visibles quand elle est fermée. */
defineProps({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  status: { type: Object, default: () => ({ type: 'default', text: '' }) },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])
</script>

<template>
  <section :id="id" class="step" :class="{ 'is-open': open }">
    <h2 class="step-title">
      <button
        type="button"
        class="step-toggle"
        :aria-expanded="open"
        :aria-controls="`${id}-panel`"
        @click="emit('update:open', !open)">
        <span class="step-index" aria-hidden="true">{{ index }}</span>
        <span class="step-name">{{ title }}</span>
        <span class="step-status" :class="`is-${status.type}`">{{ status.text }}</span>
        <span v-if="!open && summary" class="step-summary">{{ summary }}</span>
      </button>
    </h2>
    <div v-show="open" :id="`${id}-panel`" class="step-panel">
      <slot />
    </div>
  </section>
</template>

<style scoped>
</style>
