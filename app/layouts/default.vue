<script setup>
const { t } = useLocale()
</script>

<template>
  <div class="app">
    <a href="#main" class="skip-link">{{ t('nav.skip') }}</a>
    <AppHeader />
    <main id="main" class="app-main">
      <slot />
    </main>
    <footer class="app-footer">
      <div class="container app-footer-inner">
        <div class="footer-text small muted">
          <p class="footer-credit">
            {{ t('footer.credit') }}
            <a href="https://edouard-herrengt.com/" target="_blank" rel="noopener">Dev Ed</a>
          </p>
          <NuxtLink to="/mentions-legales" class="footer-legal">{{ t('legal.title') }}</NuxtLink>
        </div>
        <NuxtLink to="/" class="footer-brand">
          <AppLogo />
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
