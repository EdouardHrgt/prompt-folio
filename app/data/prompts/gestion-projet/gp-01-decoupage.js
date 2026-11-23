/**
 * GP-01 — Découpage d'un projet en phases, jalons et tâches.
 * Schéma des templates : voir docs/templates-schema.md
 */
export default {
  id: 'gp-01',
  domain: 'gestion-projet',
  version: '1.0.0',
  slug: { fr: 'decoupage-projet-taches', en: 'project-breakdown-tasks' },
  title: { fr: 'Découper un projet en tâches', en: 'Break a project down into tasks' },
  summary: {
    fr: 'Phases, jalons, tâches, livrables, dépendances et estimations, prêts à importer dans votre outil.',
    en: 'Phases, milestones, tasks, deliverables, dependencies and estimates, ready to import into your tool.'
  },

  roles: ['chef-projet-senior', 'pmo', 'scrum-master', 'directeur-programme'],
  defaultRole: 'chef-projet-senior',
  modes: ['FACTUEL', 'MIXTE', 'CREATIF'],
  formats: ['TABLEAU', 'LISTE', 'CSV', 'JSON'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TABLEAU', INFOS: 'standard', PREVIEW: true, CITATIONS: false },
  response: { audace: false, public: false, longueur: false, tons: null },

  // ─── Étape « Votre contexte » ──────────────────────────────────────────────
  fields: [
    {
      key: 'OBJECTIF',
      type: 'textarea',
      required: true,
      default: '',
      label: { fr: 'Objectif du projet', en: 'Project objective' },
      placeholder: { fr: 'Ex. : refondre le site e-commerce B2B et ajouter le paiement en ligne', en: 'E.g. rebuild the B2B e-commerce site and add online payment' }
    },
    {
      key: 'LIVRABLE',
      type: 'text',
      required: false,
      default: '',
      label: { fr: 'Livrable final', en: 'Final deliverable' },
      placeholder: { fr: 'Ex. : site en production', en: 'E.g. website live in production' }
    },
    {
      key: 'PERIMETRE',
      type: 'textarea',
      required: false,
      default: '',
      label: { fr: 'Périmètre', en: 'Scope' },
      help: { fr: 'Ce qui est inclus et ce qui est exclu.', en: 'What is in scope and what is out.' }
    },
    {
      key: 'METHODE',
      type: 'segmented',
      required: true,
      default: 'hybride',
      label: { fr: 'Méthode', en: 'Method' },
      options: [
        { value: 'cycle-v', label: { fr: 'Cycle en V', en: 'Waterfall' }, prompt: { fr: 'cycle en V (séquentiel)', en: 'waterfall (sequential)' } },
        { value: 'agile', label: { fr: 'Agile', en: 'Agile' }, prompt: { fr: 'agile / Scrum (itérations)', en: 'agile / Scrum (iterations)' } },
        { value: 'hybride', label: { fr: 'Hybride', en: 'Hybrid' }, prompt: { fr: 'hybride (cadrage séquentiel, réalisation itérative)', en: 'hybrid (sequential scoping, iterative delivery)' } }
      ]
    },
    {
      key: 'GRANULARITE',
      type: 'segmented',
      required: true,
      default: 'standard',
      label: { fr: 'Niveau de détail', en: 'Level of detail' },
      options: [
        { value: 'macro', label: { fr: 'Macro', en: 'High-level' }, hint: { fr: 'Phases et jalons', en: 'Phases and milestones' }, prompt: { fr: 'macro (phases et jalons uniquement)', en: 'high-level (phases and milestones only)' } },
        { value: 'standard', label: { fr: 'Standard', en: 'Standard' }, hint: { fr: 'Tâches de 1 à 5 jours', en: '1 to 5-day tasks' }, prompt: { fr: 'standard (tâches de 1 à 5 jours)', en: 'standard (1 to 5-day tasks)' } },
        { value: 'fine', label: { fr: 'Fin', en: 'Detailed' }, hint: { fr: 'Tâches de moins d\'un jour', en: 'Tasks under one day' }, prompt: { fr: 'fin (tâches de moins d\'un jour)', en: 'detailed (tasks under one day)' } }
      ]
    },
    {
      key: 'ECHEANCE',
      type: 'date',
      required: false,
      default: '',
      group: 'contraintes',
      label: { fr: 'Échéance', en: 'Deadline' }
    },
    {
      key: 'BUDGET',
      type: 'text',
      required: false,
      default: '',
      group: 'contraintes',
      label: { fr: 'Budget', en: 'Budget' },
      placeholder: { fr: 'Ex. : 60 k€', en: 'E.g. €60k' }
    },
    {
      key: 'EQUIPE',
      type: 'text',
      required: false,
      default: '',
      group: 'contraintes',
      label: { fr: 'Équipe disponible', en: 'Available team' },
      placeholder: { fr: 'Ex. : 3 développeurs, 1 designer', en: 'E.g. 3 developers, 1 designer' }
    },
    {
      key: 'AUTRES_CONTRAINTES',
      type: 'textarea',
      required: false,
      default: '',
      group: 'contraintes',
      label: { fr: 'Autres contraintes', en: 'Other constraints' },
      placeholder: { fr: 'Technologies imposées, dates clés, dépendances externes…', en: 'Mandatory technologies, key dates, external dependencies…' }
    }
  ],

  // ─── Textes du prompt ──────────────────────────────────────────────────────
  prompt: {
    roleFocus: {
      fr: 'Ta spécialité ici : le cadrage et le découpage de projets. Tu es pragmatique : chaque tâche doit être actionnable, assignable et vérifiable.',
      en: 'Your speciality here: scoping and breaking down projects. You are pragmatic: every task must be actionable, assignable and verifiable.'
    },
    context: [
      {
        fr: 'Je dois structurer le projet décrit dans <projet> pour le planifier et le piloter.\nMéthode : {{METHODE}}.\nNiveau de détail : {{GRANULARITE}}.',
        en: 'I need to structure the project described in <project> in order to plan and manage it.\nMethod: {{METHODE}}.\nLevel of detail: {{GRANULARITE}}.'
      }
    ],
    data: [
      {
        tag: { fr: 'projet', en: 'project' },
        items: [
          { key: 'OBJECTIF', label: { fr: 'Objectif', en: 'Objective' } },
          { key: 'LIVRABLE', label: { fr: 'Livrable final', en: 'Final deliverable' } },
          { key: 'PERIMETRE', label: { fr: 'Périmètre', en: 'Scope' } }
        ]
      },
      {
        tag: { fr: 'contraintes', en: 'constraints' },
        items: [
          { key: 'ECHEANCE', label: { fr: 'Échéance', en: 'Deadline' } },
          { key: 'BUDGET', label: { fr: 'Budget', en: 'Budget' } },
          { key: 'EQUIPE', label: { fr: 'Équipe disponible', en: 'Available team' } },
          { key: 'AUTRES_CONTRAINTES', label: { fr: 'Autres contraintes', en: 'Other constraints' } }
        ]
      }
    ],
    task: [
      { fr: '1. Reformule en 2 phrases l\'objectif du projet et son livrable final.', en: '1. Restate the project objective and its final deliverable in 2 sentences.' },
      { fr: '2. Découpe le projet en phases logiques (5 à 8 maximum).', en: '2. Break the project down into logical phases (5 to 8 maximum).' },
      { fr: '3. Pour chaque phase, définis 1 ou 2 jalons (points de décision ou de validation, durée nulle).', en: '3. For each phase, define 1 or 2 milestones (decision or approval points, zero duration).' },
      {
        fr: '4. Pour chaque phase, liste les tâches avec : ID, intitulé (verbe à l\'infinitif + objet), livrable, profil responsable, durée estimée en jours, dépendances (ID des tâches prérequises).',
        en: '4. For each phase, list the tasks with: ID, title (verb + object), deliverable, owner profile, estimated duration in days, dependencies (IDs of prerequisite tasks).',
        when: v => v.GRANULARITE !== 'macro'
      },
      {
        fr: '4. Pour chaque phase, donne uniquement ses grands livrables et sa durée estimée en jours, sans détailler les tâches.',
        en: '4. For each phase, only give its main deliverables and estimated duration in days, without detailing tasks.',
        when: v => v.GRANULARITE === 'macro'
      },
      { fr: '5. Identifie 3 à 5 points de vigilance (risques de planning, tâches sous-estimées, dépendances externes).', en: '5. Identify 3 to 5 points of attention (schedule risks, underestimated tasks, external dependencies).' }
    ],
    mode: [
      {
        fr: '- Base-toi uniquement sur le projet et les contraintes décrits : aucune tâche hors périmètre. Écris [INFO MANQUANTE : …] quand le découpage dépend d\'un élément inconnu.',
        en: '- Rely only on the project and constraints described: no out-of-scope tasks. Write [MISSING INFO: …] when the breakdown depends on an unknown element.',
        when: v => v.MODE === 'FACTUEL'
      },
      {
        fr: '- Reste fidèle au périmètre, mais ajoute les tâches que l\'on oublie souvent (recette, conduite du changement, documentation, gel du code…), étiquetées [AJOUT].',
        en: '- Stay within scope, but add the tasks people often forget (acceptance testing, change management, documentation, code freeze…), labelled [ADDED].',
        when: v => v.MODE !== 'FACTUEL'
      },
      {
        fr: '- En fin de réponse, propose une approche de découpage alternative (par exemple par MVP successifs), en quelques lignes.',
        en: '- At the end of your answer, suggest an alternative breakdown approach (for example successive MVPs) in a few lines.',
        when: v => v.MODE === 'CREATIF'
      },
      {
        fr: '- Les durées sont des estimations d\'expert : présente-les comme telles, jamais comme des faits.',
        en: '- Durations are expert estimates: present them as such, never as facts.'
      }
    ],
    format: [
      {
        fr: 'Commence par « Objectif » (2 phrases) puis « Hypothèses retenues ».',
        en: 'Start with "Objective" (2 sentences), then "Assumptions".',
        when: v => ['TABLEAU', 'LISTE'].includes(v.FORMAT)
      },
      {
        fr: 'Un tableau Markdown unique avec les colonnes :\n| ID | Phase | Type (Jalon/Tâche) | Intitulé | Livrable | Responsable | Durée (j) | Dépend de |\nIDs au format P1-T01, jalons au format P1-J1. Puis les points de vigilance en liste.',
        en: 'A single Markdown table with the columns:\n| ID | Phase | Type (Milestone/Task) | Title | Deliverable | Owner | Duration (d) | Depends on |\nIDs formatted P1-T01, milestones formatted P1-M1. Then the points of attention as a list.',
        when: v => v.FORMAT === 'TABLEAU'
      },
      {
        fr: 'Une arborescence Phase > Jalon / Tâche, une tâche par ligne :\n« ID — Intitulé (durée, responsable) ← dépendances ».\nPuis les points de vigilance.',
        en: 'A tree Phase > Milestone / Task, one task per line:\n"ID — Title (duration, owner) ← dependencies".\nThen the points of attention.',
        when: v => v.FORMAT === 'LISTE'
      },
      {
        fr: 'Uniquement du CSV, sans aucun texte avant ou après. Séparateur « ; », en-têtes :\nid;phase;type;intitule;livrable;responsable;duree_jours;depend_de\nPlusieurs dépendances sont séparées par « , ».',
        en: 'CSV only, with no text before or after. Separator ";", headers:\nid;phase;type;title;deliverable;owner;duration_days;depends_on\nMultiple dependencies are separated by ",".',
        when: v => v.FORMAT === 'CSV'
      },
      {
        fr: 'Uniquement du JSON valide, sans texte avant ou après, conforme à ce schéma :\n{"objectif": "", "hypotheses": [], "phases": [{"id": "", "nom": "", "jalons": [{"id": "", "intitule": "", "critere_validation": ""}], "taches": [{"id": "", "intitule": "", "livrable": "", "responsable": "", "duree_jours": 0, "depend_de": []}]}], "vigilance": []}',
        en: 'Valid JSON only, with no text before or after, following this schema:\n{"objective": "", "assumptions": [], "phases": [{"id": "", "name": "", "milestones": [{"id": "", "title": "", "approval_criterion": ""}], "tasks": [{"id": "", "title": "", "deliverable": "", "owner": "", "duration_days": 0, "depends_on": []}]}], "attention_points": []}',
        when: v => v.FORMAT === 'JSON'
      }
    ],
    constraints: [
      {
        fr: '- Aucune tâche de plus de 10 jours : découpe-la.',
        en: '- No task longer than 10 days: split it.',
        when: v => v.GRANULARITE === 'standard'
      },
      {
        fr: '- Aucune tâche de plus d\'une journée : découpe-la.',
        en: '- No task longer than one day: split it.',
        when: v => v.GRANULARITE === 'fine'
      },
      {
        fr: '- Les dépendances pointent vers des IDs existants, sans boucle.',
        en: '- Dependencies point to existing IDs, with no loops.',
        when: v => v.GRANULARITE !== 'macro'
      },
      {
        fr: '- Vérifie que l\'enchaînement le plus long respecte l\'échéance ({{ECHEANCE}}) ; sinon, signale l\'écart et propose des leviers.',
        en: '- Check that the longest sequence meets the deadline ({{ECHEANCE}}); if not, flag the gap and suggest levers.',
        when: v => !!v.ECHEANCE && v.FORMAT !== 'CSV'
      },
      {
        fr: '- Le planning doit tenir avant l\'échéance ({{ECHEANCE}}) : ajuste les durées ou la parallélisation en conséquence.',
        en: '- The schedule must fit before the deadline ({{ECHEANCE}}): adjust durations or parallel work accordingly.',
        when: v => !!v.ECHEANCE && v.FORMAT === 'CSV'
      }
    ],
    quality: [
      { fr: '- [ ] Chaque tâche commence par un verbe et a un livrable identifiable.', en: '- [ ] Every task starts with a verb and has an identifiable deliverable.', when: v => v.GRANULARITE !== 'macro' },
      { fr: '- [ ] Chaque phase se termine par un jalon de validation.', en: '- [ ] Every phase ends with an approval milestone.' },
      { fr: '- [ ] Les tâches transverses sont présentes (pilotage, recette, mise en production).', en: '- [ ] Cross-cutting tasks are included (management, acceptance testing, go-live).' },
      { fr: '- [ ] Le format est respecté à la lettre, sans texte parasite.', en: '- [ ] The format is followed exactly, with no extra text.', when: v => ['CSV', 'JSON'].includes(v.FORMAT) }
    ]
  }
}
