/**
 * Mentions légales et politique de confidentialité (FR / EN).
 *
 * ⚠️ À COMPLÉTER avant la mise en ligne : l'hébergeur (valeur entre crochets).
 * Pour un particulier, la loi (LCEN, art. 6 III) impose d'indiquer l'éditeur et l'hébergeur.
 * Ce texte décrit le fonctionnement actuel du site : à mettre à jour si tu ajoutes
 * des statistiques de visite, une API, un formulaire de contact, etc.
 */
export const LEGAL_INFO = {
  editor: 'Edouard Herrengt',
  website: 'https://edouard-herrengt.com/',
  host: '[À compléter : nom de l\'hébergeur, adresse, téléphone — ex. Netlify, Vercel, OVHcloud…]',
  updated: '2026-11-23'
}

/** Sections de la page. `items` = liste à puces, `text` = paragraphes. `{clé}` = valeur de LEGAL_INFO. */
export const LEGAL_SECTIONS = {
  fr: [
    {
      title: 'En résumé',
      text: [
        'Promptfolio fonctionne entièrement dans votre navigateur. Les informations que vous saisissez ne sont envoyées à aucun serveur, ne sont ni collectées ni partagées, et ne sont utilisées par aucun service tiers.',
        'Le site n\'utilise ni compte utilisateur, ni base de données, ni API, ni cookie publicitaire ou de mesure d\'audience.'
      ]
    },
    {
      title: 'Vos saisies',
      text: [
        'Le prompt est assemblé directement sur votre appareil, à partir de ce que vous saisissez dans le formulaire. Rien n\'est transmis à Promptfolio ni à un tiers.',
        'Lorsque vous copiez le prompt et le collez dans un service d\'intelligence artificielle (ChatGPT, Claude, Gemini, Le Chat…), c\'est ce service qui traite alors vos données, selon sa propre politique de confidentialité. Évitez d\'y coller des informations confidentielles ou personnelles sans vérifier ses conditions d\'utilisation.'
      ]
    },
    {
      title: 'Ce qui est enregistré dans votre navigateur',
      text: ['Pour votre confort, quelques informations sont conservées localement, sur votre appareil uniquement :'],
      items: [
        'Votre langue (cookie « pf-locale », 1 an).',
        'Votre choix de thème clair ou sombre (stockage local « pf-theme »).',
        'Le brouillon de chaque formulaire, pour le retrouver si vous rechargez la page (stockage local « pf-draft-… »).'
      ],
      after: [
        'Ces éléments sont strictement nécessaires aux fonctions que vous utilisez : ils ne nécessitent donc pas de consentement. Le bouton « Réinitialiser » efface le brouillon d\'un formulaire ; vous pouvez tout supprimer à tout moment depuis les réglages de votre navigateur (données du site).'
      ]
    },
    {
      title: 'Hébergement',
      text: [
        'Le site est hébergé par : {host}.',
        'Comme pour tout site web, l\'hébergeur peut enregistrer des données techniques de connexion (adresse IP, date, page demandée) à des fins de sécurité et de bon fonctionnement. Promptfolio n\'y a pas accès pour vous identifier et ne les exploite pas.'
      ]
    },
    {
      title: 'Liens externes',
      text: ['Les liens vers d\'autres sites (services d\'IA, site de l\'auteur) ouvrent des sites indépendants, soumis à leurs propres politiques de confidentialité.']
    },
    {
      title: 'Éditeur du site',
      items: [
        'Éditeur et directeur de la publication : {editor}.',
        'Site : {website}'
      ]
    },
    {
      title: 'Vos droits',
      text: ['Promptfolio ne collectant aucune donnée personnelle, aucun traitement n\'est effectué à votre sujet. Pour toute question, vous pouvez me contacter via {website}']
    }
  ],

  en: [
    {
      title: 'In short',
      text: [
        'Promptfolio runs entirely in your browser. The information you enter is not sent to any server, is neither collected nor shared, and is not used by any third-party service.',
        'The site uses no user account, no database, no API, and no advertising or analytics cookies.'
      ]
    },
    {
      title: 'What you enter',
      text: [
        'The prompt is assembled directly on your device from what you type into the form. Nothing is sent to Promptfolio or to any third party.',
        'When you copy the prompt and paste it into an AI service (ChatGPT, Claude, Gemini, Le Chat…), that service then processes your data under its own privacy policy. Avoid pasting confidential or personal information there without checking its terms of use.'
      ]
    },
    {
      title: 'What is stored in your browser',
      text: ['For your convenience, a few pieces of information are kept locally, on your device only:'],
      items: [
        'Your language (cookie "pf-locale", 1 year).',
        'Your light or dark theme choice (local storage "pf-theme").',
        'The draft of each form, so you get it back if you reload the page (local storage "pf-draft-…").'
      ],
      after: [
        'These items are strictly necessary for the features you use, so they do not require consent. The "Reset" button clears a form\'s draft; you can delete everything at any time from your browser settings (site data).'
      ]
    },
    {
      title: 'Hosting',
      text: [
        'The site is hosted by: {host}.',
        'As with any website, the host may record technical connection data (IP address, date, page requested) for security and operational purposes. Promptfolio has no access to it to identify you and does not use it.'
      ]
    },
    {
      title: 'External links',
      text: ['Links to other sites (AI services, the author\'s website) open independent sites, subject to their own privacy policies.']
    },
    {
      title: 'Publisher',
      items: [
        'Publisher and publication director: {editor}.',
        'Website: {website}'
      ]
    },
    {
      title: 'Your rights',
      text: ['As Promptfolio collects no personal data, no processing is carried out about you. For any question, you can reach me via {website}']
    }
  ]
}
