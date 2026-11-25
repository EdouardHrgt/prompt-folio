/**
 * Données communes à tous les templates : listes de choix (FR/EN) et champs
 * des étapes communes du formulaire (rôle, sources, réponse).
 *
 * Convention de traduction : tout texte affiché ou injecté dans le prompt est
 * un objet { fr, en }. Le helper `tr()` de prompt-builder.js choisit la langue.
 *
 * Convention des options : { value, label: {fr,en}, hint?: {fr,en}, prompt?: {fr,en} }
 *   - label  : affiché dans l'interface
 *   - hint   : aide courte (info-bulle, sous-titre de carte)
 *   - prompt : texte injecté dans le prompt (sinon, c'est le label qui est utilisé)
 */

/** Libellés des groupes de champs (attribut `group` d'un champ). */
export const FIELD_GROUPS = {
  contraintes: { fr: 'Contraintes', en: 'Constraints' },
  notes: { fr: 'Notes de projet', en: 'Project notes' },
  offre: { fr: 'Votre offre', en: 'Your offer' },
  cible: { fr: 'Votre interlocuteur', en: 'Your prospect' },
  besoin: { fr: 'Votre besoin', en: 'Your need' },
  marges: { fr: 'Vos marges de manœuvre', en: 'Your room for manoeuvre' },
  objet: { fr: 'Ce que vous vendez', en: 'What you are selling' }
}

// ─── Secteurs d'activité (spécialisent le rôle) ──────────────────────────────
export const SECTEURS = [
  { value: 'industrie', label: { fr: 'Industrie', en: 'Manufacturing' } },
  { value: 'btp', label: { fr: 'BTP / Construction', en: 'Construction' } },
  { value: 'energie', label: { fr: 'Énergie / Environnement', en: 'Energy / Environment' } },
  { value: 'sante', label: { fr: 'Santé / Pharma', en: 'Healthcare / Pharma' } },
  { value: 'tech', label: { fr: 'Tech / SaaS', en: 'Tech / SaaS' } },
  { value: 'esn', label: { fr: 'Services numériques / ESN', en: 'IT services / Consulting' } },
  { value: 'finance', label: { fr: 'Banque / Assurance', en: 'Banking / Insurance' } },
  { value: 'retail', label: { fr: 'Commerce / Retail / E-commerce', en: 'Retail / E-commerce' } },
  { value: 'logistique', label: { fr: 'Transport / Logistique', en: 'Transport / Logistics' } },
  { value: 'public', label: { fr: 'Secteur public / Collectivités', en: 'Public sector' } },
  { value: 'education', label: { fr: 'Éducation / Formation', en: 'Education / Training' } },
  { value: 'evenementiel', label: { fr: 'Événementiel / Culture', en: 'Events / Culture' } },
  { value: 'jeux-video', label: { fr: 'Jeux vidéo', en: 'Video games' } },
  { value: 'communaute', label: { fr: 'Communauté en ligne', en: 'Online community' } },
  { value: 'marketing', label: { fr: 'Marketing / Communication', en: 'Marketing / Communications' } },
  { value: 'immobilier', label: { fr: 'Immobilier', en: 'Real estate' } },
  { value: 'agro', label: { fr: 'Agroalimentaire', en: 'Food & beverage' } },
  { value: 'associatif', label: { fr: 'Associatif / ONG', en: 'Non-profit / NGO' } }
]

// ─── Postures ────────────────────────────────────────────────────────────────
export const POSTURES = [
  {
    value: 'expert',
    label: { fr: 'Expert', en: 'Expert' },
    hint: { fr: 'Recommandations tranchées, vocabulaire métier', en: 'Clear-cut recommendations, domain vocabulary' },
    prompt: {
      fr: 'Posture : expert. Donne des recommandations tranchées et utilise le vocabulaire métier.',
      en: 'Stance: expert. Give clear-cut recommendations and use domain vocabulary.'
    }
  },
  {
    value: 'challenger',
    label: { fr: 'Challenger', en: 'Challenger' },
    hint: { fr: 'Remet en cause les hypothèses, cherche les failles', en: 'Questions assumptions, looks for weaknesses' },
    prompt: {
      fr: 'Posture : challenger. Remets en cause les hypothèses, cherche les failles et les angles morts.',
      en: 'Stance: challenger. Question the assumptions, look for weaknesses and blind spots.'
    }
  },
  {
    value: 'pedagogue',
    label: { fr: 'Pédagogue', en: 'Teacher' },
    hint: { fr: 'Explique chaque étape, définit les termes', en: 'Explains each step, defines terms' },
    prompt: {
      fr: 'Posture : pédagogue. Explique chaque étape et définis les termes techniques.',
      en: 'Stance: teacher. Explain each step and define technical terms.'
    }
  },
  {
    value: 'synthetique',
    label: { fr: 'Synthétique', en: 'Concise' },
    hint: { fr: "Va droit au but, l'essentiel seulement", en: 'Straight to the point, essentials only' },
    prompt: {
      fr: 'Posture : synthétique. Va droit au but, 3 points clés maximum par section.',
      en: 'Stance: concise. Get straight to the point, 3 key points maximum per section.'
    }
  },
  {
    value: 'client',
    label: { fr: 'Côté client', en: 'Client-side' },
    hint: { fr: 'Raisonne du point de vue du destinataire', en: "Reasons from the recipient's point of view" },
    prompt: {
      fr: 'Posture : côté client. Raisonne du point de vue du destinataire ou de l\'utilisateur final.',
      en: "Stance: client-side. Reason from the recipient's or end user's point of view."
    }
  }
]

// ─── Sources ─────────────────────────────────────────────────────────────────
export const SOURCE_TYPES = [
  {
    value: 'lien',
    label: { fr: 'Lien', en: 'Link' },
    hint: {
      fr: "Lu uniquement si votre IA a accès au web. Les liens privés (Drive, SharePoint, intranet) ne sont jamais lus.",
      en: 'Only read if your AI has web access. Private links (Drive, SharePoint, intranet) are never read.'
    }
  },
  {
    value: 'document',
    label: { fr: 'Document à joindre', en: 'File to attach' },
    hint: {
      fr: "Pensez à joindre ce fichier dans votre conversation avec l'IA.",
      en: 'Remember to attach this file in your conversation with the AI.'
    }
  },
  {
    value: 'texte',
    label: { fr: 'Texte collé', en: 'Pasted text' },
    hint: { fr: "L'option la plus fiable : l'IA lit exactement ce que vous collez.", en: 'The most reliable option: the AI reads exactly what you paste.' }
  }
]

export const SOURCE_USAGES = [
  {
    value: 'reference',
    label: { fr: 'Référence', en: 'Reference' },
    hint: { fr: 'Fait autorité pour les faits et les chiffres', en: 'Authoritative for facts and figures' },
    prompt: { fr: 'référence', en: 'reference' }
  },
  {
    value: 'contexte',
    label: { fr: 'Contexte', en: 'Background' },
    hint: { fr: 'Informations de fond', en: 'Background information' },
    prompt: { fr: 'contexte', en: 'background' }
  },
  {
    value: 'style',
    label: { fr: 'Style à imiter', en: 'Style to match' },
    hint: { fr: 'Modèle de ton et de forme, pas de faits', en: 'Model for tone and form, not facts' },
    prompt: { fr: 'style', en: 'style' }
  },
  {
    value: 'inspiration',
    label: { fr: 'Inspiration', en: 'Inspiration' },
    hint: { fr: 'Pistes créatives, pas de faits', en: 'Creative ideas, not facts' },
    prompt: { fr: 'inspiration', en: 'inspiration' }
  }
]

// ─── Réponse ─────────────────────────────────────────────────────────────────
/** Périmètre des informations que l'IA peut utiliser. */
export const INFOS = [
  {
    value: 'ferme',
    label: { fr: 'Uniquement mes données', en: 'Only my data' },
    hint: { fr: 'Circuit fermé : rien d\'inventé ni de récupéré ailleurs', en: 'Closed loop: nothing invented or taken from elsewhere' }
  },
  {
    value: 'standard',
    label: { fr: 'Mes données + ses connaissances', en: 'My data + its knowledge' },
    hint: { fr: 'Elle complète avec ce qu\'elle sait déjà, sans chercher sur le web', en: 'It adds what it already knows, without searching the web' }
  },
  {
    value: 'web',
    label: { fr: 'Mes données + recherche web', en: 'My data + web search' },
    hint: { fr: 'Si votre IA a accès au web ; ce qu\'elle trouve est cité', en: 'If your AI has web access; what it finds is cited' }
  }
]

export const MODES = [
  {
    value: 'FACTUEL',
    label: { fr: 'Factuel', en: 'Factual' },
    hint: { fr: "N'invente rien, signale ce qui manque", en: 'Invents nothing, flags what is missing' }
  },
  {
    value: 'MIXTE',
    label: { fr: 'Équilibré', en: 'Balanced' },
    hint: { fr: 'Faits stricts, propositions créatives étiquetées', en: 'Strict facts, labelled creative suggestions' }
  },
  {
    value: 'CREATIF',
    label: { fr: 'Créatif', en: 'Creative' },
    hint: { fr: 'Explore librement des pistes originales', en: 'Freely explores original ideas' }
  }
]

export const AUDACE_LABELS = {
  1: { fr: 'Sûr', en: 'Safe' },
  2: { fr: 'Classique', en: 'Classic' },
  3: { fr: 'Original', en: 'Original' },
  4: { fr: 'Audacieux', en: 'Bold' },
  5: { fr: 'Disruptif', en: 'Disruptive' }
}

/** Catalogue des formats. `icon` est une clé libre pour la vignette côté UI. */
export const FORMATS = {
  TABLEAU: {
    icon: 'table',
    label: { fr: 'Tableau', en: 'Table' },
    hint: { fr: 'Tableau structuré, facile à relire', en: 'Structured table, easy to review' }
  },
  LISTE: {
    icon: 'list',
    label: { fr: 'Liste', en: 'List' },
    hint: { fr: 'Listes hiérarchisées, lecture rapide', en: 'Nested lists, quick to scan' }
  },
  TEXTE: {
    icon: 'text',
    label: { fr: 'Texte rédigé', en: 'Written text' },
    hint: { fr: 'Prose structurée avec intertitres', en: 'Structured prose with headings' }
  },
  CSV: {
    icon: 'csv',
    label: { fr: 'CSV', en: 'CSV' },
    hint: { fr: 'À importer dans Excel, Sheets, Notion, Jira…', en: 'To import into Excel, Sheets, Notion, Jira…' }
  },
  JSON: {
    icon: 'json',
    label: { fr: 'JSON', en: 'JSON' },
    hint: { fr: 'Données structurées pour un outil ou un script', en: 'Structured data for a tool or script' }
  },
  SLIDES: {
    icon: 'slides',
    label: { fr: 'Slides', en: 'Slides' },
    hint: { fr: 'Plan de présentation avec notes orateur', en: 'Presentation outline with speaker notes' }
  },
  MERMAID: {
    icon: 'diagram',
    label: { fr: 'Diagramme', en: 'Diagram' },
    hint: { fr: 'Code Mermaid, affichable en diagramme', en: 'Mermaid code, renders as a diagram' }
  },
  TABLEAU_MERMAID: {
    icon: 'table-diagram',
    label: { fr: 'Tableau + diagramme', en: 'Table + diagram' },
    hint: { fr: 'Le tableau de calcul puis le diagramme', en: 'The calculation table, then the diagram' }
  }
}

/** Formats pour lesquels une consigne de longueur n'a pas de sens. */
export const NO_LENGTH_FORMATS = ['SLIDES', 'JSON', 'CSV', 'MERMAID', 'TABLEAU_MERMAID']

export const LONGUEURS = [
  { value: 'COURT', label: { fr: 'Court', en: 'Short' }, prompt: { fr: 'courte (environ 150 mots)', en: 'short (about 150 words)' } },
  { value: 'STANDARD', label: { fr: 'Standard', en: 'Standard' }, prompt: { fr: 'standard (environ 400 mots)', en: 'standard (about 400 words)' } },
  { value: 'DETAILLE', label: { fr: 'Détaillé', en: 'Detailed' }, prompt: { fr: 'détaillée (sans limite stricte)', en: 'detailed (no strict limit)' } }
]

export const TONS = {
  neutre: { label: { fr: 'Neutre', en: 'Neutral' }, prompt: { fr: 'neutre', en: 'neutral' } },
  formel: { label: { fr: 'Formel', en: 'Formal' }, prompt: { fr: 'formel', en: 'formal' } },
  direct: { label: { fr: 'Direct', en: 'Direct' }, prompt: { fr: 'direct', en: 'direct' } },
  inspirant: { label: { fr: 'Inspirant', en: 'Inspiring' }, prompt: { fr: 'inspirant', en: 'inspiring' } },
  pedagogique: { label: { fr: 'Pédagogique', en: 'Educational' }, prompt: { fr: 'pédagogique', en: 'educational' } },
  persuasif: { label: { fr: 'Persuasif', en: 'Persuasive' }, prompt: { fr: 'persuasif', en: 'persuasive' } },
  consultatif: { label: { fr: 'Consultatif', en: 'Consultative' }, prompt: { fr: 'consultatif (à l\'écoute, orienté conseil)', en: 'consultative (attentive, advice-led)' } },
  enthousiaste: { label: { fr: 'Enthousiaste', en: 'Enthusiastic' }, prompt: { fr: 'enthousiaste', en: 'enthusiastic' } },
  premium: { label: { fr: 'Premium', en: 'Premium' }, prompt: { fr: 'premium (sobre, exigeant, haut de gamme)', en: 'premium (understated, demanding, high-end)' } },
  chaleureux: { label: { fr: 'Chaleureux', en: 'Warm' }, prompt: { fr: 'chaleureux', en: 'warm' } }
}

/** Langue de la RÉPONSE (indépendante de la langue de l'interface et du prompt). */
export const LANGUES = [
  { value: 'fr', label: { fr: 'Français', en: 'French' }, prompt: { fr: 'français', en: 'French' } },
  { value: 'en', label: { fr: 'Anglais', en: 'English' }, prompt: { fr: 'anglais', en: 'English' } },
  { value: 'es', label: { fr: 'Espagnol', en: 'Spanish' }, prompt: { fr: 'espagnol', en: 'Spanish' } },
  { value: 'de', label: { fr: 'Allemand', en: 'German' }, prompt: { fr: 'allemand', en: 'German' } },
  { value: 'it', label: { fr: 'Italien', en: 'Italian' }, prompt: { fr: 'italien', en: 'Italian' } },
  { value: 'pt', label: { fr: 'Portugais', en: 'Portuguese' }, prompt: { fr: 'portugais', en: 'Portuguese' } },
  { value: 'nl', label: { fr: 'Néerlandais', en: 'Dutch' }, prompt: { fr: 'néerlandais', en: 'Dutch' } }
]

export const PUBLIC_SUGGESTIONS = [
  { fr: 'Comité de direction', en: 'Executive committee' },
  { fr: 'Client non technique', en: 'Non-technical client' },
  { fr: 'Équipe projet', en: 'Project team' },
  { fr: 'Financeurs / sponsors', en: 'Funders / sponsors' },
  { fr: 'Équipe technique', en: 'Technical team' }
]

/**
 * Construit les champs des étapes communes (rôle, sources, réponse) pour un template.
 *
 * Types de champs (à mapper sur les composants Vue) :
 *   text, textarea, number, date, select (liste déroulante), combobox (liste + saisie libre),
 *   chips (pastilles, choix unique), segmented (boutons), slider, toggle, tags (étiquettes),
 *   cards (grandes cartes), repeater (blocs répétables), table (tableau éditable)
 *
 * `showIf(values)` : le champ n'est affiché (et validé) que si la fonction renvoie true.
 * `advanced: true` : à placer derrière un « Personnaliser » / accordéon fermé.
 */
export function buildCommonFields (template, roles) {
  const o = template.response || {}

  const role = [
    {
      key: 'ROLE',
      type: 'chips',
      required: true,
      default: template.defaultRole,
      label: { fr: 'Rôle', en: 'Role' },
      help: { fr: "Qui doit vous répondre ? Le rôle recommandé est présélectionné.", en: 'Who should answer you? The recommended role is preselected.' },
      options: template.roles.map(id => ({
        value: id,
        label: roles[id].label,
        hint: roles[id].hint,
        recommended: id === template.defaultRole
      }))
    },
    {
      key: 'SECTEUR',
      type: 'combobox',
      required: false,
      default: '',
      label: { fr: "Secteur d'activité", en: 'Industry' },
      help: { fr: 'Spécialise le rôle dans votre secteur. Choisissez dans la liste ou saisissez le vôtre.', en: 'Specialises the role in your industry. Pick from the list or type your own.' },
      options: SECTEURS
    },
    {
      key: 'POSTURE',
      type: 'chips',
      required: false,
      default: template.defaults?.POSTURE ?? 'expert',
      label: { fr: 'Posture', en: 'Stance' },
      options: POSTURES
    },
    {
      key: 'ROLE_PRECISION',
      type: 'textarea',
      required: false,
      default: '',
      advanced: true,
      label: { fr: 'Affiner le rôle', en: 'Refine the role' },
      placeholder: { fr: 'Ex. : 10 ans d\'expérience en marchés publics', en: 'E.g. 10 years of experience in public procurement' }
    }
  ]

  const sources = [
    {
      key: 'SOURCES',
      type: 'repeater',
      required: false,
      default: [],
      max: 10,
      label: { fr: 'Sources', en: 'Sources' },
      help: {
        fr: "Documents ou pages sur lesquels l'IA doit s'appuyer. Le texte collé est le plus fiable.",
        en: 'Documents or pages the AI should rely on. Pasted text is the most reliable.'
      },
      addLabel: { fr: 'Ajouter une source', en: 'Add a source' },
      itemFields: [
        { key: 'type', type: 'segmented', required: true, default: 'lien', label: { fr: 'Type', en: 'Type' }, options: SOURCE_TYPES },
        { key: 'titre', type: 'text', required: false, default: '', label: { fr: 'Titre', en: 'Title' }, placeholder: { fr: 'Ex. : Grille tarifaire 2026', en: 'E.g. 2026 price list' } },
        { key: 'url', type: 'text', required: true, default: '', label: { fr: 'Adresse (URL)', en: 'Address (URL)' }, placeholder: { fr: 'https://…', en: 'https://…' }, showIf: item => item.type === 'lien' },
        { key: 'fichier', type: 'text', required: true, default: '', label: { fr: 'Nom du fichier', en: 'File name' }, placeholder: { fr: 'Ex. : devis_fournisseurA.pdf', en: 'E.g. supplierA_quote.pdf' }, showIf: item => item.type === 'document' },
        { key: 'texte', type: 'textarea', required: true, default: '', label: { fr: 'Contenu', en: 'Content' }, showIf: item => item.type === 'texte' },
        { key: 'usage', type: 'chips', required: true, default: 'reference', label: { fr: 'Usage', en: 'Use as' }, options: SOURCE_USAGES },
        { key: 'note', type: 'text', required: false, default: '', label: { fr: 'Note', en: 'Note' } }
      ]
    },
    {
      key: 'CITATIONS',
      type: 'toggle',
      required: false,
      default: template.defaults?.CITATIONS ?? false,
      label: { fr: 'Citer les sources dans la réponse', en: 'Cite sources in the answer' },
      showIf: v => (v.SOURCES?.length > 0) || v.INFOS === 'web'
    }
  ]

  const reponse = []

  if (template.modes.length > 1) {
    reponse.push({
      key: 'MODE',
      type: 'segmented',
      required: true,
      default: template.defaults.MODE,
      label: { fr: 'Type de réponse', en: 'Type of answer' },
      options: MODES.filter(m => template.modes.includes(m.value))
    })
  }
  if (o.audace) {
    reponse.push({
      key: 'AUDACE',
      type: 'slider',
      required: false,
      default: template.defaults?.AUDACE ?? 3,
      min: 1,
      max: 5,
      marks: AUDACE_LABELS,
      label: { fr: 'Audace', en: 'Boldness' },
      showIf: v => (v.MODE ?? template.defaults.MODE) !== 'FACTUEL'
    })
  }
  reponse.push({
    key: 'INFOS',
    type: 'cards',
    required: true,
    default: template.defaults?.INFOS ?? 'standard',
    label: { fr: "Informations utilisées par l'IA", en: 'Information the AI may use' },
    help: {
      fr: '« Uniquement mes données » est idéal pour un rapport sur vos propres chiffres (chiffre d\'affaires, budget, planning…).',
      en: '"Only my data" is ideal for a report on your own figures (revenue, budget, schedule…).'
    },
    options: INFOS
  })
  // Un seul format possible : pas de choix à proposer (le prompt garde la section format).
  if (template.formats.length > 1) reponse.push({
    key: 'FORMAT',
    type: 'cards',
    required: true,
    default: template.defaults.FORMAT,
    label: { fr: 'Format', en: 'Format' },
    options: template.formats.map(f => ({ value: f, ...FORMATS[f] }))
  })
  if (o.public) {
    reponse.push({
      key: 'PUBLIC',
      type: 'combobox',
      required: o.public === 'required',
      default: '',
      label: { fr: 'Destinataire', en: 'Audience' },
      placeholder: { fr: 'Ex. : comité de direction', en: 'E.g. executive committee' },
      options: PUBLIC_SUGGESTIONS.map(s => ({ value: s.fr, label: s }))
    })
  }
  if (o.longueur) {
    reponse.push({
      key: 'LONGUEUR',
      type: 'segmented',
      required: false,
      default: 'STANDARD',
      showIf: v => !NO_LENGTH_FORMATS.includes(v.FORMAT),
      label: { fr: 'Longueur', en: 'Length' },
      options: LONGUEURS
    })
  }
  if (o.tons) {
    reponse.push({
      key: 'TON',
      type: 'chips',
      required: false,
      default: o.tons[0],
      label: { fr: 'Ton', en: 'Tone' },
      options: o.tons.map(t => ({ value: t, ...TONS[t] }))
    })
  }
  reponse.push(
    {
      key: 'LANGUE',
      type: 'select',
      required: true,
      default: null, // null = langue de l'interface
      label: { fr: 'Langue de la réponse', en: 'Answer language' },
      options: LANGUES
    },
    {
      key: 'EXEMPLE',
      type: 'textarea',
      required: false,
      default: '',
      advanced: true,
      label: { fr: 'Exemple de résultat attendu', en: 'Example of the expected result' },
      help: { fr: "L'IA en copiera la forme (structure, ton, niveau de détail), jamais le contenu.", en: 'The AI will copy its form (structure, tone, level of detail), never its content.' }
    },
    {
      key: 'PREVIEW',
      type: 'toggle',
      required: false,
      default: template.defaults?.PREVIEW ?? false,
      label: { fr: "Valider la structure avant la réponse complète", en: 'Approve the structure before the full answer' },
      help: {
        fr: "L'IA montre d'abord un aperçu et attend votre « OK ». À désactiver pour un usage automatisé (API, script).",
        en: 'The AI first shows a preview and waits for your "OK". Turn off for automated use (API, script).'
      }
    }
  )

  return { role, sources, reponse }
}
