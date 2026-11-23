<script setup>
defineProps({ error: { type: Object, default: null } })
const { t } = useLocale()
</script>

<template>
  <NuxtLayout>
    <div class="container">
      <h1>{{ error?.statusCode === 404 ? '404' : error?.statusCode }}</h1>
      <p>{{ error?.statusCode === 404 ? t('error.notFound') : error?.message }}</p>
      <button type="button" class="btn" @click="clearError({ redirect: '/' })">{{ t('error.back') }}</button>
    </div>
  </NuxtLayout>
</template>
