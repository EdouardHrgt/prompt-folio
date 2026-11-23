<script setup>
const { t, locale, setLocale } = useLocale()
const { init, toggle } = useTheme()

// Chaque langue est nommée dans sa propre langue (accessibilité).
const languages = [
  { code: 'fr', label: 'Français', flag: resolveComponent('FlagFr') },
  { code: 'en', label: 'English', flag: resolveComponent('FlagGb') }
]

// Menu des réglages (mobile uniquement : sur grand écran, les réglages restent visibles).
const menuOpen = ref(false)
const menuRoot = ref(null)
const closeMenu = () => { menuOpen.value = false }
// composedPath() est figé au moment du clic : fiable même si l'icône cliquée vient d'être remplacée.
const onDocumentClick = event => { if (menuOpen.value && !event.composedPath().includes(menuRoot.value)) closeMenu() }
const onKeydown = event => { if (event.key === 'Escape') closeMenu() }

onMounted(() => {
  init()
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header class="app-header">
    <div class="container app-header-inner">
      <NuxtLink to="/" class="brand">
        <AppLogo />
        <span class="brand-tagline muted">{{ t('app.tagline') }}</span>
      </NuxtLink>

      <div ref="menuRoot" class="header-menu">
        <button
          type="button"
          class="icon-btn menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="header-tools"
          :aria-label="menuOpen ? t('menu.close') : t('menu.open')"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
            <path v-if="menuOpen" d="M6 6l12 12M18 6L6 18" />
            <path v-else d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div id="header-tools" class="header-tools" :class="{ 'is-open': menuOpen }">
          <div class="lang-switch" role="group" :aria-label="t('lang.label')">
            <button
              v-for="lang in languages"
              :key="lang.code"
              type="button"
              class="icon-btn"
              :lang="lang.code"
              :aria-label="lang.label"
              :title="lang.label"
              :aria-pressed="locale === lang.code"
              @click="setLocale(lang.code)"
            >
              <component :is="lang.flag" />
            </button>
          </div>

          <button
            type="button"
            class="icon-btn theme-toggle"
            :aria-label="t('theme.toggle')"
            :title="t('theme.toggle')"
            @click="toggle"
          >
            <IconMoon class="theme-icon-moon" />
            <IconSun class="theme-icon-sun" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
