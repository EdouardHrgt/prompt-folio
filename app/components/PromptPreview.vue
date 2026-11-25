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

// ─── Surbrillance : les lignes qui viennent de changer s'allument puis s'estompent ───
const FLASH_MS = 1200
const textEl = ref(null)
const lines = computed(() => props.prompt.split('\n'))
const flashed = ref(new Set()) // indices des lignes à mettre en valeur
const flashId = ref(0) // change la clé des lignes allumées pour relancer l'animation
let flashTimer

watch(() => props.prompt, (next, prev) => {
  // Lignes absentes de l'ancien prompt (comptées une à une : une ligne répétée reste repérée).
  const before = new Map()
  for (const line of prev.split('\n')) before.set(line, (before.get(line) || 0) + 1)
  const changed = new Set()
  next.split('\n').forEach((line, i) => {
    const left = before.get(line) || 0
    if (left) before.set(line, left - 1)
    else if (line.trim()) changed.add(i)
  })
  // Changement de langue, réinitialisation, brouillon restauré : pas de surbrillance générale.
  if (!changed.size || changed.size > lines.value.length / 2) {
    flashed.value = new Set()
    return
  }
  flashed.value = changed
  flashId.value++
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flashed.value = new Set() }, FLASH_MS)
  nextTick(scrollToFlash)
})

// Fait défiler l'aperçu (pas la page) jusqu'à la première ligne allumée si elle est hors de vue.
function scrollToFlash () {
  const box = textEl.value
  const first = box?.querySelector('.is-flash')
  if (!first) return
  const view = box.getBoundingClientRect()
  const line = first.getBoundingClientRect()
  if (!view.height || (line.top >= view.top && line.bottom <= view.bottom)) return
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  box.scrollTo({ top: box.scrollTop + line.top - view.top - view.height / 3, behavior: smooth ? 'smooth' : 'auto' })
}

onBeforeUnmount(() => clearTimeout(flashTimer))

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

    <pre ref="textEl" class="preview-text" tabindex="0"><span v-for="(line, i) in lines" :key="flashed.has(i) ? `f${flashId}-${i}` : i" class="preview-line" :class="{ 'is-flash': flashed.has(i) }">{{ line }}{{ i < lines.length - 1 ? '\n' : '' }}</span></pre>

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
