<script setup>
import { DOMAINS } from '~/data/prompts/index.js'
import { LLM_LINKS } from '~/locales/ui.js'

const { t, l } = useLocale()

const activeDomains = DOMAINS.filter(d => !d.comingSoon)
const soonDomains = DOMAINS.filter(d => d.comingSoon)

// Phrase d'accroche : le texte autour de {llms}, puis les IA en liens séparés par « , » et « ou ».
const subtitle = computed(() => {
  const [before, after = ''] = t('home.subtitle').split('{llms}')
  return { before, after }
})
const separator = i => (i === LLM_LINKS.length - 1 ? '' : i === LLM_LINKS.length - 2 ? ` ${t('list.or')} ` : ', ')

useHead(() => ({ title: `Promptfolio — ${t('app.tagline')}` }))
</script>

<template>
  <div class="container">
    <section class="hero">
      <h1>{{ t('home.title') }}</h1>
      <p class="muted">
        {{ subtitle.before }}<template v-for="(llm, i) in LLM_LINKS" :key="llm.name"><a class="llm-link" :href="llm.url" target="_blank" rel="noopener">{{ llm.name }}</a>{{ separator(i) }}</template>{{ subtitle.after }}
      </p>
    </section>

    <section v-for="domain in activeDomains" :key="domain.id" class="domain">
      <header class="domain-head">
        <h2 class="domain-title">
          <DomainIcon :name="domain.icon" />
          {{ l(domain.label) }}
        </h2>
      </header>
      <p v-if="domain.summary" class="muted">{{ l(domain.summary) }}</p>

      <ul class="card-grid">
        <li v-for="tpl in domain.templates" :key="tpl.id">
          <NuxtLink :to="`/prompt/${tpl.id}`" class="card card-link">
            <strong>{{ l(tpl.title) }}</strong>
            <span class="muted small">{{ l(tpl.summary) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <p v-if="soonDomains.length" class="muted">
      {{ t('home.soonDomains') }}
      <span v-for="domain in soonDomains" :key="domain.id" class="badge badge-icon">
        <DomainIcon :name="domain.icon" />{{ l(domain.label) }}
      </span>
    </p>
  </div>
</template>
