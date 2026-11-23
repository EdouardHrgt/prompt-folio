<script setup>
const { locale } = useLocale()
useHead(() => ({ htmlAttrs: { lang: locale.value } }))
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
