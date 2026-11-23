/**
 * Textes de l'interface (FR / EN).
 * Format compatible avec une migration future vers @nuxtjs/i18n (clés à plat, variables {n}).
 * Les textes des templates de prompts, eux, sont dans app/data/prompts.
 */
/** IA citées sur l'accueil (liens). L'ordre ici est l'ordre d'affichage. */
export const LLM_LINKS = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Claude', url: 'https://claude.ai/' },
  { name: 'Gemini', url: 'https://gemini.google.com/' },
  { name: 'Le Chat', url: 'https://chat.mistral.ai/' }
]

export const UI = {
  fr: {
    'app.name': 'Promptfolio',
    'app.tagline': 'Prompts professionnels sur mesure',
    'nav.home': 'Accueil',
    'nav.skip': 'Aller au contenu',
    'lang.label': 'Langue',
    'theme.toggle': 'Basculer entre thème clair et sombre',
    'menu.open': 'Ouvrir les réglages (langue, thème)',
    'menu.close': 'Fermer les réglages',
    'footer.credit': 'Conçu et développé par',
    'legal.title': 'Mentions légales et confidentialité',
    'legal.description': 'Promptfolio fonctionne entièrement dans votre navigateur : aucune donnée saisie n\'est envoyée ni utilisée par un service tiers.',
    'legal.updated': 'Dernière mise à jour :',

    'home.title': 'Des prompts professionnels, en quelques clics',
    'home.subtitle': 'Choisissez une tâche, renseignez votre contexte : vous obtenez un prompt complet, fiable et prêt à coller dans {llms}.',
    'list.or': 'ou',
    'home.comingSoon': 'Bientôt',
    'home.soonDomains': 'Prochainement :',

    'form.required': 'obligatoire',
    'form.recommended': 'recommandé',
    'form.customize': 'Personnaliser',
    'form.add': 'Ajouter',
    'form.remove': 'Supprimer',
    'form.item': 'Élément {n}',
    'form.tagsPlaceholder': 'Tapez puis Entrée',

    'status.toFill': '{n} à remplir',
    'status.done': 'Complet',
    'status.default': 'Par défaut',
    'status.custom': 'Personnalisé',
    'status.optional': 'Facultatif',

    'summary.filled': '{n} / {total} champs renseignés',
    'summary.sources': '{n} source(s)',
    'summary.noSources': 'Aucune source',
    'summary.preview': 'aperçu d\'abord',

    'table.predecessors': 'Prédécesseurs',
    'table.none': 'aucun',
    'table.import': 'Importer un CSV',
    'table.importHelp': 'Collez un CSV (par exemple celui produit par « Découper un projet en tâches »). Colonnes reconnues : id, intitulé, durée, prédécesseurs.',
    'table.importButton': 'Importer (remplace les tâches)',
    'table.importError': 'Impossible de lire ce CSV : vérifiez la ligne d\'en-tête.',
    'table.imported': '{n} tâche(s) importée(s).',

    'preview.title': 'Votre prompt',
    'preview.words': 'mots',
    'preview.tokens': 'tokens environ',
    'preview.missing': 'Il reste {n} champ(s) à compléter :',
    'preview.copy': 'Copier le prompt',
    'preview.copied': 'Copié !',
    'preview.copyError': 'Copie impossible : sélectionnez le texte manuellement.',
    'preview.download': 'Télécharger (.txt)',
    'preview.reset': 'Réinitialiser',
    'preview.attachReminder': 'Pensez à joindre dans votre IA les fichiers indiqués comme « document à joindre ».',
    'preview.tabForm': 'Formulaire',
    'preview.tabPrompt': 'Prompt',

    'error.notFound': 'Cette page n\'existe pas.',
    'error.back': 'Retour à l\'accueil'
  },

  en: {
    'app.name': 'Promptfolio',
    'app.tagline': 'Tailored professional prompts',
    'nav.home': 'Home',
    'nav.skip': 'Skip to content',
    'lang.label': 'Language',
    'theme.toggle': 'Switch between light and dark theme',
    'menu.open': 'Open settings (language, theme)',
    'menu.close': 'Close settings',
    'footer.credit': 'Designed and built by',
    'legal.title': 'Legal notice & privacy',
    'legal.description': 'Promptfolio runs entirely in your browser: nothing you enter is sent to or used by any third-party service.',
    'legal.updated': 'Last updated:',

    'home.title': 'Professional prompts in a few clicks',
    'home.subtitle': 'Pick a task, describe your context: you get a complete, reliable prompt ready to paste into {llms}.',
    'list.or': 'or',
    'home.comingSoon': 'Coming soon',
    'home.soonDomains': 'Coming soon:',

    'form.required': 'required',
    'form.recommended': 'recommended',
    'form.customize': 'Customise',
    'form.add': 'Add',
    'form.remove': 'Remove',
    'form.item': 'Item {n}',
    'form.tagsPlaceholder': 'Type then press Enter',

    'status.toFill': '{n} to fill in',
    'status.done': 'Complete',
    'status.default': 'Default',
    'status.custom': 'Customised',
    'status.optional': 'Optional',

    'summary.filled': '{n} / {total} fields filled in',
    'summary.sources': '{n} source(s)',
    'summary.noSources': 'No sources',
    'summary.preview': 'preview first',

    'table.predecessors': 'Predecessors',
    'table.none': 'none',
    'table.import': 'Import a CSV',
    'table.importHelp': 'Paste a CSV (for example the one produced by "Break a project down into tasks"). Recognised columns: id, title, duration, predecessors.',
    'table.importButton': 'Import (replaces the tasks)',
    'table.importError': 'Could not read this CSV: check the header row.',
    'table.imported': '{n} task(s) imported.',

    'preview.title': 'Your prompt',
    'preview.words': 'words',
    'preview.tokens': 'tokens approx.',
    'preview.missing': '{n} field(s) still to complete:',
    'preview.copy': 'Copy the prompt',
    'preview.copied': 'Copied!',
    'preview.copyError': 'Copy failed: select the text manually.',
    'preview.download': 'Download (.txt)',
    'preview.reset': 'Reset',
    'preview.attachReminder': 'Remember to attach the files marked as "file to attach" in your AI.',
    'preview.tabForm': 'Form',
    'preview.tabPrompt': 'Prompt',

    'error.notFound': 'This page does not exist.',
    'error.back': 'Back to home'
  }
}
