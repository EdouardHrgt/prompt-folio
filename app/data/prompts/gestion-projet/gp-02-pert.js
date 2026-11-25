/**
 * GP-02 — Chemin critique et diagramme PERT.
 * Le champ TACHES est un tableau éditable : la colonne `predecesseurs` se choisit
 * parmi les IDs des autres lignes (aucune dépendance invalide possible).
 */

import { F } from '../fields.js'
import { all, filled, formatIs, formatIsNot, is, jsonFormat } from '../helpers.js'

const estim3 = is('ESTIMATION', 'trois-points')

export default {
  id: 'gp-02',
  domain: 'gestion-projet',
  version: '1.0.0',
  slug: { fr: 'chemin-critique-pert', en: 'critical-path-pert' },
  title: { fr: 'Calculer le chemin critique (PERT)', en: 'Calculate the critical path (PERT)' },
  summary: {
    fr: 'Dates au plus tôt et au plus tard, marges, chemin critique et diagramme PERT à partir de vos tâches.',
    en: 'Early and late dates, float, critical path and PERT diagram from your tasks.'
  },
  warning: {
    fr: 'Les IA peuvent se tromper dans les calculs sur les gros réseaux (plus de 30 tâches) : vérifiez les résultats critiques dans un tableur.',
    en: 'AIs can make calculation errors on large networks (over 30 tasks): double-check critical results in a spreadsheet.'
  },

  roles: ['planificateur', 'chef-projet-senior', 'pmo'],
  defaultRole: 'planificateur',
  modes: ['FACTUEL'],
  formats: ['TABLEAU_MERMAID', 'TABLEAU', 'MERMAID', 'JSON'],
  defaults: { MODE: 'FACTUEL', FORMAT: 'TABLEAU_MERMAID', INFOS: 'ferme', PREVIEW: false, CITATIONS: false },
  response: { audace: false, public: false, longueur: false, tons: null },

  fields: [
    F.choice('segmented', 'ESTIMATION', { fr: 'Estimation des durées', en: 'Duration estimates' }, [
      { value: 'simple', label: { fr: 'Une durée', en: 'Single duration' }, hint: { fr: 'Une durée par tâche', en: 'One duration per task' } },
      { value: 'trois-points', label: { fr: '3 points', en: '3-point' }, hint: { fr: 'Optimiste, probable, pessimiste', en: 'Optimistic, most likely, pessimistic' } }
    ]),
    F.choice('select', 'UNITE', { fr: 'Unité de durée', en: 'Duration unit' }, [
      { value: 'jours-ouvres', label: { fr: 'Jours ouvrés', en: 'Working days' }, prompt: { fr: 'jours ouvrés', en: 'working days' } },
      { value: 'jours', label: { fr: 'Jours calendaires', en: 'Calendar days' }, prompt: { fr: 'jours calendaires', en: 'calendar days' } },
      { value: 'semaines', label: { fr: 'Semaines', en: 'Weeks' }, prompt: { fr: 'semaines', en: 'weeks' } },
      { value: 'heures', label: { fr: 'Heures', en: 'Hours' }, prompt: { fr: 'heures', en: 'hours' } }
    ]),
    F.date('DATE_DEBUT', { fr: 'Date de démarrage', en: 'Start date' }, {
      help: { fr: 'Facultatif : pour obtenir des dates calendaires.', en: 'Optional: to get calendar dates.' }
    }),
    F.table('TACHES', { fr: 'Tâches', en: 'Tasks' }, [
      { key: 'id', type: 'text', required: true, auto: 'letter', label: { fr: 'ID', en: 'ID' } },
      F.text('intitule', { fr: 'Intitulé', en: 'Title' }, { required: true }),
      F.number('duree', { fr: 'Durée', en: 'Duration' }, { required: true, min: 0, showIf: (item, v) => !estim3(v) }),
      F.number('optimiste', { fr: 'Optimiste', en: 'Optimistic' }, { required: true, min: 0, showIf: (item, v) => estim3(v) }),
      F.number('probable', { fr: 'Probable', en: 'Most likely' }, { required: true, min: 0, showIf: (item, v) => estim3(v) }),
      F.number('pessimiste', { fr: 'Pessimiste', en: 'Pessimistic' }, { required: true, min: 0, showIf: (item, v) => estim3(v) }),
      { key: 'predecesseurs', type: 'multiselect', required: false, default: [], optionsFrom: 'rows.id', label: { fr: 'Prédécesseurs', en: 'Predecessors' } }
    ], {
      required: true,
      min: 2,
      max: 60,
      help: {
        fr: 'Une ligne par tâche. Vous pouvez aussi importer le CSV produit par « Découper un projet en tâches ».',
        en: 'One row per task. You can also import the CSV produced by "Break a project down into tasks".'
      },
      import: {
        format: 'csv',
        parser: 'tasks',
        from: 'gp-01',
        help: {
          fr: 'Collez un CSV (par exemple celui produit par « Découper un projet en tâches »). Colonnes reconnues : id, intitulé, durée, prédécesseurs.',
          en: 'Paste a CSV (for example the one produced by "Break a project down into tasks"). Recognised columns: id, title, duration, predecessors.'
        }
      },
      addLabel: { fr: 'Ajouter une tâche', en: 'Add a task' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : analyser un réseau de tâches. Tu montres tes calculs et tu vérifies la cohérence du réseau avant de conclure.',
      en: 'Your mission: analyse a task network. You show your calculations and check the network is consistent before concluding.'
    },
    context: [
      {
        fr: 'Je dois identifier le chemin critique de mon projet pour savoir quelles tâches ne doivent subir aucun retard et où se trouvent les marges.\nLes durées sont exprimées en {{UNITE}}.',
        en: 'I need to identify the critical path of my project to know which tasks must not slip and where the float is.\nDurations are expressed in {{UNITE}}.'
      },
      { fr: 'Date de démarrage du projet : {{DATE_DEBUT}}.', en: 'Project start date: {{DATE_DEBUT}}.', when: filled('DATE_DEBUT') }
    ],
    data: [
      {
        tag: { fr: 'taches', en: 'tasks' },
        items: [
          {
            key: 'TACHES',
            render: (rows, v, locale) => {
              const head = estim3(v)
                ? (locale === 'fr' ? 'ID;intitulé;optimiste;probable;pessimiste;prédécesseurs' : 'ID;title;optimistic;most_likely;pessimistic;predecessors')
                : (locale === 'fr' ? 'ID;intitulé;durée;prédécesseurs' : 'ID;title;duration;predecessors')
              const lines = rows.map(r => {
                const preds = r.predecesseurs?.length ? r.predecesseurs.join(',') : '-'
                return estim3(v)
                  ? [r.id, r.intitule, r.optimiste, r.probable, r.pessimiste, preds].join(';')
                  : [r.id, r.intitule, r.duree, preds].join(';')
              })
              return [head, ...lines].join('\n')
            }
          }
        ]
      }
    ],
    task: [
      { fr: '1. Valide le réseau : prédécesseurs inexistants, boucles, tâches orphelines. Signale toute anomalie.', en: '1. Validate the network: non-existent predecessors, loops, orphan tasks. Flag any anomaly.' },
      {
        fr: '2. Calcule pour chaque tâche la durée attendue te = (O + 4M + P) / 6 et l\'écart-type σ = (P − O) / 6.',
        en: '2. For each task, calculate the expected duration te = (O + 4M + P) / 6 and the standard deviation σ = (P − O) / 6.',
        when: estim3
      },
      { fr: '3. Passe avant : début au plus tôt (DTO) et fin au plus tôt (FTO) de chaque tâche.', en: '3. Forward pass: early start (ES) and early finish (EF) of each task.' },
      { fr: '4. Passe arrière : fin au plus tard (FTA) et début au plus tard (DTA).', en: '4. Backward pass: late finish (LF) and late start (LS).' },
      { fr: '5. Calcule la marge totale (DTA − DTO) et la marge libre de chaque tâche (plus petit DTO de ses successeurs − sa FTO ; durée totale − FTO pour la dernière tâche). Pour chaque tâche non critique dont la marge libre est nulle, nomme le successeur qu\'un retard décalerait.', en: '5. Calculate the total float (LS − ES) and free float of each task (smallest ES of its successors − its EF; total duration − EF for the last task). For each non-critical task with zero free float, name the successor a delay would push back.' },
      { fr: '6. Identifie le chemin critique (marge totale = 0) et la durée totale du projet.', en: '6. Identify the critical path (total float = 0) and the total project duration.' },
      {
        fr: '7. Convertis en dates calendaires à partir de la date de démarrage (sans tenir compte des jours fériés).',
        en: '7. Convert to calendar dates from the start date (ignoring public holidays).',
        when: filled('DATE_DEBUT')
      },
      { fr: '8. Donne 3 recommandations concrètes : où concentrer la surveillance, quelles tâches paralléliser ou renforcer pour raccourcir le projet. Ne propose d\'accélérer une tâche non critique que si elle est le prédécesseur déterminant d\'une tâche critique (celui dont la FTO fixe son DTO) ; sinon, précise que cela ne raccourcirait pas le projet.', en: '8. Give 3 concrete recommendations: where to focus monitoring, which tasks to parallelise or reinforce to shorten the project. Only suggest speeding up a non-critical task if it is the determining predecessor of a critical task (the one whose EF sets its ES); otherwise, state that it would not shorten the project.' }
    ],
    mode: [
      { fr: '- Utilise uniquement les tâches, durées et dépendances fournies. N\'en ajoute aucune.', en: '- Only use the tasks, durations and dependencies provided. Do not add any.' },
      { fr: '- Si une durée ou un prédécesseur manque, écris [INFO MANQUANTE : …] et fais le calcul sans la tâche concernée, en le signalant.', en: '- If a duration or predecessor is missing, write [MISSING INFO: …] and run the calculation without that task, saying so.' },
      { fr: '- Les recommandations sont étiquetées RECOMMANDATION.', en: '- Recommendations are labelled RECOMMENDATION.' }
    ],
    format: [
      {
        fr: 'Commence par « Anomalies du réseau » (ou « Aucune anomalie ») et « Hypothèses retenues ».',
        en: 'Start with "Network anomalies" (or "No anomalies") and "Assumptions".',
        when: formatIsNot('JSON')
      },
      {
        fr: 'Tableau Markdown :\n| ID | Tâche | Durée | Prédécesseurs | DTO | FTO | DTA | FTA | Marge totale | Marge libre | Critique |',
        en: 'Markdown table:\n| ID | Task | Duration | Predecessors | ES | EF | LS | LF | Total float | Free float | Critical |',
        when: formatIs('TABLEAU', 'TABLEAU_MERMAID')
      },
      { fr: 'Ajoute les colonnes te et σ.', en: 'Add the te and σ columns.', when: all(estim3, formatIs('TABLEAU', 'TABLEAU_MERMAID')) },
      { fr: 'Ajoute les colonnes de dates calendaires.', en: 'Add the calendar date columns.', when: all(filled('DATE_DEBUT'), formatIs('TABLEAU', 'TABLEAU_MERMAID')) },
      {
        fr: 'Puis : « Chemin critique : A → C → F → … » et « Durée totale : N {{UNITE}} ».',
        en: 'Then: "Critical path: A → C → F → …" and "Total duration: N {{UNITE}}".',
        when: formatIsNot('JSON')
      },
      { fr: 'Ajoute la durée attendue ± σ du chemin critique.', en: 'Add the expected duration ± σ of the critical path.', when: all(estim3, formatIsNot('JSON')) },
      {
        fr: 'Diagramme : un bloc de code mermaid de type « flowchart LR », un nœud par tâche au format ID["ID · Intitulé<br/>durée · marge"], un nœud Début et un nœud Fin. Mets en valeur les tâches critiques avec :\nclassDef critique fill:#ffdddd,stroke:#c00,stroke-width:2px',
        en: 'Diagram: a mermaid code block of type "flowchart LR", one node per task formatted ID["ID · Title<br/>duration · float"], plus a Start node and an End node. Highlight critical tasks with:\nclassDef critical fill:#ffdddd,stroke:#c00,stroke-width:2px',
        when: formatIs('MERMAID', 'TABLEAU_MERMAID')
      },
      { fr: 'Termine par les 3 recommandations.', en: 'End with the 3 recommendations.', when: formatIsNot('JSON') },
      jsonFormat({
        fr: '{"anomalies": [], "duree_totale": 0, "unite": "", "chemins_critiques": [[]], "taches": [{"id": "", "intitule": "", "duree": 0, "predecesseurs": [], "dto": 0, "fto": 0, "dta": 0, "fta": 0, "marge_totale": 0, "marge_libre": 0, "critique": true}], "recommandations": []}',
        en: '{"anomalies": [], "total_duration": 0, "unit": "", "critical_paths": [[]], "tasks": [{"id": "", "title": "", "duration": 0, "predecessors": [], "es": 0, "ef": 0, "ls": 0, "lf": 0, "total_float": 0, "free_float": 0, "critical": true}], "recommendations": []}'
      })
    ],
    constraints: [
      { fr: '- Convention : le projet démarre au temps 0 ; le DTO d\'une tâche est le maximum des FTO de ses prédécesseurs.', en: '- Convention: the project starts at time 0; a task\'s ES is the maximum EF of its predecessors.' },
      { fr: '- Plusieurs chemins critiques peuvent coexister : liste-les tous.', en: '- Several critical paths may coexist: list them all.' }
    ],
    quality: [
      { fr: '- [ ] La FTO de la dernière tâche est égale à la durée totale annoncée.', en: '- [ ] The EF of the last task equals the stated total duration.' },
      { fr: '- [ ] Les tâches critiques ont une marge totale de 0 et forment une chaîne continue du début à la fin.', en: '- [ ] Critical tasks have zero total float and form a continuous chain from start to end.' },
      { fr: '- [ ] Aucune marge n\'est négative (sinon, recalcule).', en: '- [ ] No float is negative (otherwise, recalculate).' },
      { fr: '- [ ] Chaque explication est cohérente avec les valeurs du tableau, et le nombre de tâches critiques annoncé correspond au tableau.', en: '- [ ] Every explanation is consistent with the table values, and the stated number of critical tasks matches the table.' },
      { fr: '- [ ] Le code Mermaid est valide (IDs sans espaces ni accents).', en: '- [ ] The Mermaid code is valid (IDs without spaces or accents).', when: formatIs('MERMAID', 'TABLEAU_MERMAID') }
    ]
  }
}
