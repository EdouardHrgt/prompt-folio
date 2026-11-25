/**
 * GP-03 — Bilan chiffré de fin de projet (retour d'expérience).
 */

import { F } from '../fields.js'
import { PM } from './fields.js'
import { filled, formatIs, jsonFormat, missing } from '../helpers.js'

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
  response: {
    audace: false,
    public: true,
    longueur: true,
    tons: ['neutre', 'formel', 'direct'],
    // Le tableau et les listes imposées ne tiennent pas dans 400 mots : la longueur ne vise que la prose.
    lengthScope: {
      fr: 'Cette longueur s\'applique aux seules parties rédigées (analyses, message clé) ; le tableau et les listes imposées n\'y sont pas comptés, mais reste concis.',
      en: 'This length applies only to the written parts (analyses, key message); the table and required lists are not counted, but stay concise.'
    }
  },

  fields: [
    PM.projectName(),
    PM.team({
      label: { fr: 'Équipe du projet', en: 'Project team' },
      placeholder: { fr: 'Ex. : 1 développeur en solo ; 2 devs + 1 chef de projet', en: 'E.g. 1 solo developer; 2 devs + 1 project manager' }
    }),
    F.textarea('OBJECTIF_PROJET', { fr: 'Objectif initial du projet', en: 'Original project objective' }, {
      promptLabel: { fr: 'Objectif initial', en: 'Original objective' }
    }),
    F.repeater('INDICATEURS', { fr: 'Indicateurs prévu / réel', en: 'Planned / actual indicators' }, [
      F.choice('select', 'axe', { fr: 'Axe', en: 'Area' }, AXES),
      F.text('libelle', { fr: 'Indicateur', en: 'Indicator' }, { required: true, placeholder: { fr: 'Ex. : Budget total', en: 'E.g. Total budget' } }),
      F.text('prevu', { fr: 'Prévu', en: 'Planned' }, { required: true }),
      F.text('reel', { fr: 'Réel', en: 'Actual' }, { required: true }),
      F.text('unite', { fr: 'Unité', en: 'Unit' }, { placeholder: { fr: 'k€, j/h, semaines…', en: 'k€, person-days, weeks…' } }),
      F.toggle('positif_si_hausse', { fr: 'Un dépassement est positif', en: 'Exceeding is positive' }, { help: { fr: 'Ex. : chiffre d\'affaires, taux de satisfaction', en: 'E.g. revenue, satisfaction rate' } })
    ], {
      required: true,
      min: 1,
      max: 20,
      help: { fr: 'Un bloc par indicateur : budget, date de fin, jours-hommes, KPI…', en: 'One block per indicator: budget, end date, person-days, KPI…' },
      addLabel: { fr: 'Ajouter un indicateur', en: 'Add an indicator' }
    }),
    F.textarea('AUTRES_CHIFFRES', { fr: 'Autres éléments chiffrés', en: 'Other figures' }),
    F.repeater('RETOURS', { fr: 'Retours qualitatifs', en: 'Qualitative feedback' }, [
      F.choice('chips', 'type', { fr: 'Type', en: 'Type' }, RETOUR_TYPES),
      F.textarea('texte', { fr: 'Retour', en: 'Feedback' }, { required: true })
    ], {
      max: 20,
      help: { fr: 'Réussites, difficultés, incidents, verbatims d\'équipe ou de clients.', en: 'Successes, difficulties, incidents, quotes from the team or clients.' },
      addLabel: { fr: 'Ajouter un retour', en: 'Add feedback' }
    })
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
        items: ['NOM_PROJET', 'OBJECTIF_PROJET', 'EQUIPE']
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
          'AUTRES_CHIFFRES'
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
        fr: '2. Détermine le sens de chaque écart : un dépassement (réel > prévu) est défavorable, sauf pour les indicateurs marqués « un dépassement est positif », où c\'est un écart négatif qui est défavorable. Attribue ensuite un statut qui n\'alerte que sur le défavorable : 🟢 écart favorable ou ≤ 5 %, 🟠 écart défavorable de 5 à 15 %, 🔴 écart défavorable de plus de 15 %.',
        en: '2. Determine the direction of each variance: exceeding (actual > planned) is unfavourable, except for indicators marked "exceeding is positive", where a negative variance is unfavourable. Then give a status that only flags unfavourable variances: 🟢 favourable or ≤ 5%, 🟠 unfavourable 5 to 15%, 🔴 unfavourable over 15%.'
      },
      { fr: '3. Analyse les causes probables des écarts 🟠 et 🔴 à partir des données et des retours.', en: '3. Analyse the likely causes of 🟠 and 🔴 variances using the data and feedback.' },
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
        fr: 'Texte rédigé avec les intertitres « Synthèse », « Tableau de bord », « Analyse des écarts », « Réussites et difficultés », « Enseignements », « Recommandations ». Le tableau de bord reste un tableau, avec une colonne « Sens » (favorable / défavorable).',
        en: 'Written text with the headings "Summary", "Dashboard", "Variance analysis", "Successes and difficulties", "Lessons learned", "Recommendations". The dashboard stays a table, with a "Direction" column (favourable / unfavourable).',
        when: formatIs('TEXTE')
      },
      {
        fr: 'Un tableau principal | Axe | Indicateur | Prévu | Réel | Écart | Écart % | Sens | Statut | Cause probable (analyse) |, puis des listes courtes : réussites, difficultés, enseignements, recommandations.',
        en: 'A main table | Area | Indicator | Planned | Actual | Variance | Variance % | Direction | Status | Likely cause (analysis) |, then short lists: successes, difficulties, lessons, recommendations.',
        when: formatIs('TABLEAU')
      },
      {
        fr: '6 à 8 slides au format « Slide N — Titre », 3 à 5 puces chacune, puis « Note orateur : ». Ordre : message clé · tableau de bord · focus écarts · réussites · difficultés · enseignements · recommandations · (annexe chiffres).',
        en: '6 to 8 slides formatted "Slide N — Title", 3 to 5 bullets each, then "Speaker note:". Order: key message · dashboard · variance focus · successes · difficulties · lessons · recommendations · (appendix: figures).',
        when: formatIs('SLIDES')
      },
      jsonFormat({
        fr: '{"projet": "", "message_cle": "", "indicateurs": [{"axe": "", "indicateur": "", "prevu": null, "reel": null, "ecart": null, "ecart_pct": null, "sens": "favorable | defavorable", "statut": "", "cause_probable": ""}], "reussites": [], "difficultes": [], "enseignements": [], "recommandations": [{"action": "", "porteur": "", "echeance": ""}]}',
        en: '{"project": "", "key_message": "", "indicators": [{"area": "", "indicator": "", "planned": null, "actual": null, "variance": null, "variance_pct": null, "direction": "favourable | unfavourable", "status": "", "likely_cause": ""}], "successes": [], "difficulties": [], "lessons": [], "recommendations": [{"action": "", "owner": "", "due": ""}]}'
      })
    ],
    constraints: [
      { fr: '- Pas de jugement sur des personnes : on analyse des processus et des décisions.', en: '- No judgement of individuals: analyse processes and decisions.' },
      { fr: '- Garde les unités d\'origine et précise-les dans chaque colonne ou ligne.', en: '- Keep the original units and state them in every column or line.' },
      { fr: '- Les responsables des recommandations font partie de l\'équipe indiquée : n\'invente pas de rôle qui n\'existe pas dans le projet.', en: '- The owners of the recommendations belong to the team given: do not invent roles that do not exist in the project.', when: filled('EQUIPE') },
      { fr: '- Équipe non précisée : désigne les responsables par des rôles génériques et signale-le dans « Hypothèses retenues ».', en: '- Team not specified: name owners by generic roles and say so in "Assumptions".', when: missing('EQUIPE') }
    ],
    quality: [
      { fr: '- [ ] Chaque écart % est recalculé et cohérent avec le prévu et le réel.', en: '- [ ] Every variance % is recalculated and consistent with planned and actual.' },
      { fr: '- [ ] Chaque écart 🔴 a au moins une cause et une recommandation associées.', en: '- [ ] Every 🔴 variance has at least one cause and one recommendation.' },
      { fr: '- [ ] Le message clé se comprend sans lire le reste.', en: '- [ ] The key message is understandable without reading the rest.' },
      { fr: '- [ ] Seuls les écarts défavorables portent un statut 🟠 ou 🔴.', en: '- [ ] Only unfavourable variances have a 🟠 or 🔴 status.' }
    ]
  }
}
