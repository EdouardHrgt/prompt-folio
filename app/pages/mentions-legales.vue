<script setup>
import { LEGAL_INFO, LEGAL_SECTIONS } from '~/data/legal.js'

const { t, locale } = useLocale()

const fill = text => text.replace(/\{(\w+)\}/g, (_, key) => LEGAL_INFO[key] ?? '')
const sections = computed(() => LEGAL_SECTIONS[locale.value] ?? LEGAL_SECTIONS.fr)
const updated = computed(() => new Date(LEGAL_INFO.updated).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))

useHead(() => ({
  title: `${t('legal.title')} — Promptfolio`,
  meta: [{ name: 'description', content: t('legal.description') }]
}))
</script>

<template>
  <div class="container legal">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <NuxtLink to="/">{{ t('nav.home') }}</NuxtLink> / {{ t('legal.title') }}
    </nav>

    <h1>{{ t('legal.title') }}</h1>
    <p class="muted small">{{ t('legal.updated') }} {{ updated }}</p>

    <section v-for="section in sections" :key="section.title" class="legal-section">
      <h2>{{ section.title }}</h2>
      <p v-for="(paragraph, i) in section.text || []" :key="`t${i}`">{{ fill(paragraph) }}</p>
      <ul v-if="section.items">
        <li v-for="(item, i) in section.items" :key="`i${i}`">{{ fill(item) }}</li>
      </ul>
      <p v-for="(paragraph, i) in section.after || []" :key="`a${i}`">{{ fill(paragraph) }}</p>
    </section>
  </div>
</template>
