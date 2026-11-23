// https://nuxt.com/docs/api/configuration/nuxt-config

// Applique le thème (clair / sombre) avant le premier affichage, pour éviter le flash blanc.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('pf-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Promptfolio',
      meta: [
        { name: 'description', content: 'Générateur de prompts professionnels personnalisables. Professional prompt generator.' },
        { name: 'color-scheme', content: 'light dark' }
      ],
      script: [{ innerHTML: THEME_SCRIPT, tagPosition: 'head' }]
    }
  }
})
