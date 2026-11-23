<script setup>
import { getTemplate } from '~/data/prompts/index.js'

const route = useRoute()
const found = getTemplate(route.params.id)
if (!found) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })

const { template, domain } = found
const { t, l } = useLocale()
const form = usePromptForm(template)

// Seule la section « contexte » est ouverte au départ.
const open = reactive(Object.fromEntries(form.steps.map(s => [s.id, s.id === 'contexte'])))
const mobileTab = ref('form')

/** Amène l'utilisateur sur un champ à compléter (depuis l'aperçu). */
async function goTo (item) {
  form.attempted.value = true
  open[item.step] = true
  mobileTab.value = 'form'
  await nextTick()
  const target = document.getElementById(`field-${item.key}`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  target?.querySelector('input, textarea, select, button')?.focus({ preventScroll: true })
}

useHead(() => ({
  title: `${l(template.title)} — Promptfolio`,
  meta: [{ name: 'description', content: l(template.summary) }]
}))
</script>

<template>
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink> / {{ l(domain.label) }}
    </nav>

    <header class="page-head">
      <h1>{{ l(template.title) }}</h1>
      <p class="muted">{{ l(template.summary) }}</p>
      <p v-if="template.warning" class="notice small">{{ l(template.warning) }}</p>
    </header>

    <div class="mobile-tabs" role="tablist">
      <button type="button" class="btn btn-small" role="tab" :aria-selected="mobileTab === 'form'" :aria-pressed="mobileTab === 'form'" @click="mobileTab = 'form'">
        {{ t('preview.tabForm') }}
      </button>
      <button type="button" class="btn btn-small" role="tab" :aria-selected="mobileTab === 'prompt'" :aria-pressed="mobileTab === 'prompt'" @click="mobileTab = 'prompt'">
        {{ t('preview.tabPrompt') }}
      </button>
    </div>

    <div class="generator" :data-tab="mobileTab">
      <form class="generator-form" novalidate @submit.prevent>
        <PromptSection
          v-for="(step, i) in form.steps"
          :id="`step-${step.id}`"
          :key="step.id"
          v-model:open="open[step.id]"
          :index="i + 1"
          :title="l(step.label)"
          :summary="form.summary(step)"
          :status="form.status(step)"
        >
          <template v-for="block in form.blocks(step)" :key="block.key">
            <fieldset v-if="block.group" class="field-group">
              <legend>{{ l(block.label) }}</legend>
              <PromptField
                v-for="field in block.fields"
                :key="field.key"
                v-model="form.values[field.key]"
                :field="field"
                :values="form.values"
                :errors="form.fieldErrors(field.key)"
                :show-errors="form.attempted.value"
              />
            </fieldset>

            <details v-else-if="block.advanced" class="advanced">
              <summary>{{ t('form.customize') }}</summary>
              <PromptField
                v-for="field in block.fields"
                :key="field.key"
                v-model="form.values[field.key]"
                :field="field"
                :values="form.values"
                :errors="form.fieldErrors(field.key)"
                :show-errors="form.attempted.value"
              />
            </details>

            <template v-else>
              <PromptField
                v-for="field in block.fields"
                :key="field.key"
                v-model="form.values[field.key]"
                :field="field"
                :values="form.values"
                :errors="form.fieldErrors(field.key)"
                :show-errors="form.attempted.value"
              />
            </template>
          </template>
        </PromptSection>
      </form>

      <PromptPreview
        :prompt="form.prompt.value"
        :stats="form.stats.value"
        :missing="form.missing.value"
        :attach-reminder="form.hasAttachments.value"
        :filename="`promptfolio-${template.id}`"
        @go-to="goTo"
        @reset="form.reset()"
      />
    </div>
  </div>
</template>
