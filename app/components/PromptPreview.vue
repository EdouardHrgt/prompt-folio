<script setup>
/** Panneau d'aperçu : prompt en direct, champs manquants, copier / télécharger / réinitialiser. */
const props = defineProps({
  prompt: { type: String, required: true },
  stats: { type: Object, required: true },
  missing: { type: Array, default: () => [] },
  filename: { type: String, default: 'prompt' },
  attachReminder: { type: Boolean, default: false }
})
const emit = defineEmits(['go-to', 'reset'])
const { t } = useLocale()

const copyState = ref('') // '' | 'copied' | 'error'

async function copy () {
  if (props.missing.length) {
    emit('go-to', props.missing[0])
    return
  }
  try {
    await navigator.clipboard.writeText(props.prompt)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'error'
  }
  setTimeout(() => { copyState.value = '' }, 2500)
}

function download () {
  const blob = new Blob([props.prompt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: `${props.filename}.txt` })
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <aside class="preview" aria-labelledby="preview-title">
    <div class="preview-head">
      <h2 id="preview-title">{{ t('preview.title') }}</h2>
      <span class="small muted">≈ {{ stats.tokens }} {{ t('preview.tokens') }} · {{ stats.words }} {{ t('preview.words') }}</span>
    </div>

    <div v-if="missing.length" class="preview-missing">
      <p class="preview-status">{{ t('preview.missing', { n: missing.length }) }}</p>
      <ul>
        <li v-for="item in missing" :key="`${item.key}-${item.index}-${item.itemKey}`">
          <button type="button" class="btn-link" @click="emit('go-to', item)">{{ item.label }}</button>
        </li>
      </ul>
    </div>

    <pre class="preview-text" tabindex="0">{{ prompt }}</pre>

    <p v-if="attachReminder" class="notice small">{{ t('preview.attachReminder') }}</p>

    <div class="preview-actions">
      <button type="button" class="btn btn-primary" @click="copy">
        {{ copyState === 'copied' ? t('preview.copied') : t('preview.copy') }}
      </button>
      <button type="button" class="btn" @click="download">{{ t('preview.download') }}</button>
      <button type="button" class="btn btn-ghost" @click="emit('reset')">{{ t('preview.reset') }}</button>
    </div>
    <p v-if="copyState === 'error'" class="field-error" role="alert">{{ t('preview.copyError') }}</p>
  </aside>
</template>
