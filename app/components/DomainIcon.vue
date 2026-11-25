<script setup>
/**
 * Icône d'un domaine (clé `icon` du domaine dans data/prompts/index.js).
 * Style trait, couleur héritée (currentColor), taille relative au texte (1em par défaut).
 */
defineProps({ name: { type: String, required: true } })
</script>

<template>
  <svg
    class="domain-icon"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Gestion de projet : tableau kanban -->
    <template v-if="name === 'kanban'">
      <rect x="3" y="4" width="5" height="15" rx="1" />
      <rect x="9.5" y="4" width="5" height="10" rx="1" />
      <rect x="16" y="4" width="5" height="12" rx="1" />
    </template>
    <!-- Vente : courbe de croissance -->
    <template v-else-if="name === 'trend'">
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </template>
    <!-- Rédaction & communication : stylo -->
    <template v-else-if="name === 'pen'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </template>
    <!-- Développement : chevrons de code -->
    <template v-else-if="name === 'code'">
      <polyline points="8 6 2 12 8 18" />
      <polyline points="16 6 22 12 16 18" />
    </template>
    <!-- Événementiel : calendrier -->
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </template>
    <!-- Créatif : étincelles -->
    <template v-else-if="name === 'sparkles'">
      <path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </template>
    <!-- Par défaut : un cercle -->
    <circle v-else cx="12" cy="12" r="8" />
  </svg>
</template>
