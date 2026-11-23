/**
 * GP-03 — Bilan chiffré de fin de projet (retour d'expérience).
 */

const AXES = [
  { value: 'couts', label: { fr: 'Coûts', en: 'Costs' } },
  { value: 'delais', label: { fr: 'Délais', en: 'Schedule' } },
  { value: 'charge', label: { fr: 'Charge', en: 'Effort' } },
  { value: 'perimetre', label: { fr: 'Périmètre', en: 'Scope' } },
  { value: 'qualite', label: { fr: 'Qualité', en: 'Quality' } },
  { value: 'kpi', label: { fr: 'KPI métier', en: 'Business KPI' } },
  { value: 'autre', label: { fr: 'Autre', en: 'Other' } }
]

const RETOUR_TYPES = [
  { value: 'reussite', label: { fr: 'Réussite', en: 'Success' } },
  { value: 'difficulte', label: { fr: 'Difficulté', en: 'Difficulty' } },
  { value: 'incident', label: { fr: 'Incident', en: 'Incident' } },
  { value: 'verbatim', label: { fr: 'Verbatim', en: 'Quote' } }
]

const labelOf = (list, value, locale) => list.find(o => o.value === value)?.label[locale] ?? value

export default {
  id: 'gp-03',
  domain: 'gestion-projet',
  version: '1.0.0',
  slug: { fr: 'bilan-fin-de-projet', en: 'project-closure-report' },
  title: { fr: 'Faire le bilan chiffré d\'un projet', en: 'Write a project closure report' },
  summary: {
    fr: 'Écarts prévu / réel calculés, analyse des causes, enseignements et recommandations.',
    en: 'Planned vs actual variances, root causes, lessons learned and recommendations.'
  },

  roles: ['pmo', 'controleur-gestion', 'chef-projet-senior', 'directeur-programme'],
  defaultRole: 'pmo',
  modes: ['FACTUEL'],
  formats: ['TEXTE', 'TABLEAU', 'SLIDES', 'JSON'],
  defaults: { MODE: 'FACTUEL', FORMAT: 'TEXTE', INFOS: 'ferme', PREVIEW: true, CITATIONS: true },
  response: { audace: false, public: true, longueur: true, tons: ['neutre', 'formel', 'direct'] },

  fields: [
    {
      key: 'NOM_PROJET',
      type: 'text',
      required: true,
      default: '',
      label: { fr: 'Nom du projet', en: 'Project name' },
      placeholder: { fr: 'Ex. : Déploiement CRM — 4 agences', en: 'E.g. CRM rollout — 4 branches' }
    },
    {
      key: 'OBJECTIF_PROJET',
      type: 'textarea',
      required: false,
      default: '',
      label: { fr: 'Objectif initial du projet', en: 'Original project objective' }
    },
    {
      key: 'INDICATEURS',
      type: 'repeater',
      required: true,
      min: 1,
      max: 20,
      default: [],
      label: { fr: 'Indicateurs prévu / réel', en: 'Planned / actual indicators' },
      help: { fr: 'Un bloc par indicateur : budget, date de fin, jours-hommes, KPI…', en: 'One block per indicator: budget, end date, person-days, KPI…' },
      addLabel: { fr: 'Ajouter un indicateur', en: 'Add an indicator' },
      itemFields: [
        { key: 'axe', type: 'select', required: true, default: 'couts', label: { fr: 'Axe', en: 'Area' }, options: AXES },
        { key: 'libelle', type: 'text', required: true, default: '', label: { fr: 'Indicateur', en: 'Indicator' }, placeholder: { fr: 'Ex. : Budget total', en: 'E.g. Total budget' } },
        { key: 'prevu', type: 'text', required: true, default: '', label: { fr: 'Prévu', en: 'Planned' } },
        { key: 'reel', type: 'text', required: true, default: '', label: { fr: 'Réel', en: 'Actual' } },
        { key: 'unite', type: 'text', required: false, default: '', label: { fr: 'Unité', en: 'Unit' }, placeholder: { fr: 'k€, j/h, semaines…', en: 'k€, person-days, weeks…' } },
        { key: 'positif_si_hausse', type: 'toggle', required: false, default: false, label: { fr: 'Un dépassement est positif', en: 'Exceeding is positive' }, help: { fr: 'Ex. : chiffre d\'affaires, taux de satisfaction', en: 'E.g. revenue, satisfaction rate' } }
      ]
    },
    {
      key: 'AUTRES_CHIFFRES',
      type: 'textarea',
      required: false,
      default: '',
      label: { fr: 'Autres éléments chiffrés', en: 'Other figures' }
    },
    {
      key: 'RETOURS',
      type: 'repeater',
      required: false,
      default: [],
      max: 20,
      label: { fr: 'Retours qualitatifs', en: 'Qualitative feedback' },
      help: { fr: 'Réussites, difficultés, incidents, verbatims d\'équipe ou de clients.', en: 'Successes, difficulties, incidents, quotes from the team or clients.' },
      addLabel: { fr: 'Ajouter un retour', en: 'Add feedback' },
      itemFields: [
        { key: 'type', type: 'chips', required: true, default: 'reussite', label: { fr: 'Type', en: 'Type' }, options: RETOUR_TYPES },
        { key: 'texte', type: 'textarea', required: true, default: '', label: { fr: 'Retour', en: 'Feedback' } }
      ]
    }
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : produire un bilan de fin de projet honnête, chiffré et orienté amélioration continue, ni complaisant ni accusateur.',
      en: 'Your mission: produce an honest, quantified project closure report focused on continuous improvement, neither complacent nor accusatory.'
    },
    context: [
      {
        fr: 'Le projet « {{NOM_PROJET}} » est terminé. Le bilan doit permettre de décider et d\'apprendre, pas seulement de constater.',
        en: 'The project "{{NOM_PROJET}}" is complete. The report must support decisions and learning, not just state facts.'
      }
    ],
    data: [
      {
        tag: { fr: 'projet', en: 'project' },
        items: [
          { key: 'NOM_PROJET', label: { fr: 'Nom', en: 'Name' } },
          { key: 'OBJECTIF_PROJET', label: { fr: 'Objectif initial', en: 'Original objective' } }
        ]
      },
      {
        tag: { fr: 'indicateurs', en: 'indicators' },
        items: [
          {
            key: 'INDICATEURS',
            render: (rows, v, locale) => rows.map(r => {
              const unit = r.unite ? ` (${r.unite})` : ''
              const pos = r.positif_si_hausse ? (locale === 'fr' ? ' — un dépassement est positif' : ' — exceeding is positive') : ''
              return locale === 'fr'
                ? `- [${labelOf(AXES, r.axe, locale)}] ${r.libelle} : prévu ${r.prevu} / réel ${r.reel}${unit}${pos}`
                : `- [${labelOf(AXES, r.axe, locale)}] ${r.libelle}: planned ${r.prevu} / actual ${r.reel}${unit}${pos}`
            }).join('\n')
          },
          { key: 'AUTRES_CHIFFRES', label: { fr: 'Autres éléments chiffrés', en: 'Other figures' } }
        ]
      },
      {
        tag: { fr: 'retours', en: 'feedback' },
        items: [
          {
            key: 'RETOURS',
            render: (rows, v, locale) => rows.map(r => `- [${labelOf(RETOUR_TYPES, r.type, locale)}] ${r.texte}`).join('\n')
          }
        ]
      }
    ],
    task: [
      {
        fr: '1. Calcule les écarts pour chaque indicateur : écart absolu (réel − prévu) et écart relatif en % ((réel − prévu) / prévu × 100), arrondi à 1 décimale.',
        en: '1. Calculate the variance for each indicator: absolute variance (actual − planned) and relative variance in % ((actual − planned) / planned × 100), rounded to 1 decimal place.'
      },
      {
        fr: '2. Attribue un statut à chaque indicateur : 🟢 conforme (écart ≤ 5 %), 🟠 écart modéré (5 à 15 %), 🔴 écart significatif (> 15 %). Quand un dépassement est positif, inverse la lecture.',
        en: '2. Give each indicator a status: 🟢 on target (variance ≤ 5%), 🟠 moderate variance (5 to 15%), 🔴 significant variance (> 15%). When exceeding is positive, reverse the reading.'
      },
      { fr: '3. Analyse les causes probables des écarts significatifs à partir des données et des retours.', en: '3. Analyse the likely causes of significant variances using the data and feedback.' },
      { fr: '4. Synthétise : 3 réussites, 3 difficultés, 3 à 5 enseignements réutilisables.', en: '4. Summarise: 3 successes, 3 difficulties, 3 to 5 reusable lessons.' },
      { fr: '5. Formule des recommandations actionnables pour les prochains projets (qui, quoi, quand).', en: '5. Make actionable recommendations for future projects (who, what, when).' },
      { fr: '6. Rédige un message clé de 2 phrases pour le destinataire.', en: '6. Write a 2-sentence key message for the audience.' }
    ],
    mode: [
      { fr: '- Chaque chiffre provient des données, d\'une source consultée ou d\'un calcul que tu montres. Aucun chiffre inventé.', en: '- Every figure comes from the data, a consulted source or a calculation you show. No invented figures.' },
      { fr: '- Si une valeur manque pour un indicateur, écris [INFO MANQUANTE : …] et ne calcule pas d\'écart.', en: '- If a value is missing for an indicator, write [MISSING INFO: …] and do not calculate a variance.' },
      { fr: '- Distingue FAIT (chiffre ou retour fourni), ANALYSE (cause probable déduite) et RECOMMANDATION.', en: '- Distinguish FACT (figure or feedback provided), ANALYSIS (inferred likely cause) and RECOMMENDATION.' }
    ],
    format: [
      {
        fr: 'Texte rédigé avec les intertitres « Synthèse », « Tableau de bord », « Analyse des écarts », « Réussites et difficultés », « Enseignements », « Recommandations ». Le tableau de bord reste un tableau.',
        en: 'Written text with the headings "Summary", "Dashboard", "Variance analysis", "Successes and difficulties", "Lessons learned", "Recommendations". The dashboard stays a table.',
        when: v => v.FORMAT === 'TEXTE'
      },
      {
        fr: 'Un tableau principal | Axe | Indicateur | Prévu | Réel | Écart | Écart % | Statut | Cause principale |, puis des listes courtes : réussites, difficultés, enseignements, recommandations.',
        en: 'A main table | Area | Indicator | Planned | Actual | Variance | Variance % | Status | Main cause |, then short lists: successes, difficulties, lessons, recommendations.',
        when: v => v.FORMAT === 'TABLEAU'
      },
      {
        fr: '6 à 8 slides au format « Slide N — Titre », 3 à 5 puces chacune, puis « Note orateur : ». Ordre : message clé · tableau de bord · focus écarts · réussites · difficultés · enseignements · recommandations · (annexe chiffres).',
        en: '6 to 8 slides formatted "Slide N — Title", 3 to 5 bullets each, then "Speaker note:". Order: key message · dashboard · variance focus · successes · difficulties · lessons · recommendations · (appendix: figures).',
        when: v => v.FORMAT === 'SLIDES'
      },
      {
        fr: 'Uniquement du JSON valide, sans texte avant ou après, conforme à ce schéma :\n{"projet": "", "message_cle": "", "indicateurs": [{"axe": "", "indicateur": "", "prevu": null, "reel": null, "ecart": null, "ecart_pct": null, "statut": "", "cause": ""}], "reussites": [], "difficultes": [], "enseignements": [], "recommandations": [{"action": "", "porteur": "", "echeance": ""}]}',
        en: 'Valid JSON only, with no text before or after, following this schema:\n{"project": "", "key_message": "", "indicators": [{"area": "", "indicator": "", "planned": null, "actual": null, "variance": null, "variance_pct": null, "status": "", "cause": ""}], "successes": [], "difficulties": [], "lessons": [], "recommendations": [{"action": "", "owner": "", "due": ""}]}',
        when: v => v.FORMAT === 'JSON'
      }
    ],
    constraints: [
      { fr: '- Pas de jugement sur des personnes : on analyse des processus et des décisions.', en: '- No judgement of individuals: analyse processes and decisions.' },
      { fr: '- Garde les unités d\'origine et précise-les dans chaque colonne ou ligne.', en: '- Keep the original units and state them in every column or line.' }
    ],
    quality: [
      { fr: '- [ ] Chaque écart % est recalculé et cohérent avec le prévu et le réel.', en: '- [ ] Every variance % is recalculated and consistent with planned and actual.' },
      { fr: '- [ ] Chaque écart 🔴 a au moins une cause et une recommandation associées.', en: '- [ ] Every 🔴 variance has at least one cause and one recommendation.' },
      { fr: '- [ ] Le message clé se comprend sans lire le reste.', en: '- [ ] The key message is understandable without reading the rest.' }
    ]
  }
}
