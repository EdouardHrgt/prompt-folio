/**
 * GP-01 — Découpage d'un projet en phases, jalons et tâches.
 * Schéma des templates : voir docs/templates-schema.md
 */
import { F } from '../fields.js'
import { PM } from './fields.js'
import { all, csvFormat, filled, formatIs, formatIsNot, is, isNot, jsonFormat, modeIs, modeIsNot, strictFormatCheck } from '../helpers.js'

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
    PM.objective(),
    PM.deliverable(),
    PM.scope(),
    PM.method(),
    F.choice('segmented', 'GRANULARITE', { fr: 'Niveau de détail', en: 'Level of detail' }, [
      { value: 'macro', label: { fr: 'Macro', en: 'High-level' }, hint: { fr: 'Phases et jalons', en: 'Phases and milestones' }, prompt: { fr: 'macro (phases et jalons uniquement)', en: 'high-level (phases and milestones only)' } },
      { value: 'standard', label: { fr: 'Standard', en: 'Standard' }, hint: { fr: 'Tâches de 1 à 5 jours', en: '1 to 5-day tasks' }, prompt: { fr: 'standard (tâches de 1 à 5 jours)', en: 'standard (1 to 5-day tasks)' } },
      { value: 'fine', label: { fr: 'Fin', en: 'Detailed' }, hint: { fr: 'Tâches de moins d\'un jour', en: 'Tasks under one day' }, prompt: { fr: 'fin (tâches de moins d\'un jour)', en: 'detailed (tasks under one day)' } }
    ], { default: 'standard' }),
    PM.deadline({ group: 'contraintes' }),
    PM.budget({ group: 'contraintes' }),
    PM.team({ group: 'contraintes' }),
    F.textarea('AUTRES_CONTRAINTES', { fr: 'Autres contraintes', en: 'Other constraints' }, {
      group: 'contraintes',
      placeholder: { fr: 'Technologies imposées, dates clés, dépendances externes…', en: 'Mandatory technologies, key dates, external dependencies…' }
    })
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
      { tag: { fr: 'projet', en: 'project' }, items: ['OBJECTIF', 'LIVRABLE', 'PERIMETRE'] },
      { tag: { fr: 'contraintes', en: 'constraints' }, items: ['ECHEANCE', 'BUDGET', 'EQUIPE', 'AUTRES_CONTRAINTES'] }
    ],
    task: [
      { fr: '1. Reformule en 2 phrases l\'objectif du projet et son livrable final.', en: '1. Restate the project objective and its final deliverable in 2 sentences.' },
      { fr: '2. Découpe le projet en phases logiques (5 à 8 maximum).', en: '2. Break the project down into logical phases (5 to 8 maximum).' },
      { fr: '3. Pour chaque phase, définis 1 ou 2 jalons (points de décision ou de validation, durée nulle).', en: '3. For each phase, define 1 or 2 milestones (decision or approval points, zero duration).' },
      {
        fr: '4. Pour chaque phase, liste les tâches avec : ID, intitulé (verbe à l\'infinitif + objet), livrable, profil responsable, durée estimée en jours, dépendances (ID des tâches prérequises).',
        en: '4. For each phase, list the tasks with: ID, title (verb + object), deliverable, owner profile, estimated duration in days, dependencies (IDs of prerequisite tasks).',
        when: isNot('GRANULARITE', 'macro')
      },
      {
        fr: '4. Pour chaque phase, donne uniquement ses grands livrables et sa durée estimée en jours, sans détailler les tâches.',
        en: '4. For each phase, only give its main deliverables and estimated duration in days, without detailing tasks.',
        when: is('GRANULARITE', 'macro')
      },
      { fr: '5. Identifie 3 à 5 points de vigilance (risques de planning, tâches sous-estimées, dépendances externes).', en: '5. Identify 3 to 5 points of attention (schedule risks, underestimated tasks, external dependencies).' }
    ],
    mode: [
      {
        fr: '- Base-toi uniquement sur le projet et les contraintes décrits : aucune tâche hors périmètre. Écris [INFO MANQUANTE : …] quand le découpage dépend d\'un élément inconnu.',
        en: '- Rely only on the project and constraints described: no out-of-scope tasks. Write [MISSING INFO: …] when the breakdown depends on an unknown element.',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Reste fidèle au périmètre, mais ajoute les tâches que l\'on oublie souvent (recette, conduite du changement, documentation, gel du code…), étiquetées [AJOUT].',
        en: '- Stay within scope, but add the tasks people often forget (acceptance testing, change management, documentation, code freeze…), labelled [ADDED].',
        when: modeIsNot('FACTUEL')
      },
      {
        fr: '- En fin de réponse, propose une approche de découpage alternative (par exemple par MVP successifs), en quelques lignes.',
        en: '- At the end of your answer, suggest an alternative breakdown approach (for example successive MVPs) in a few lines.',
        when: modeIs('CREATIF')
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
        when: formatIs('TABLEAU', 'LISTE')
      },
      {
        fr: 'Un tableau Markdown unique avec les colonnes :\n| ID | Phase | Type (Jalon/Tâche) | Intitulé | Livrable | Responsable | Durée (j) | Dépend de |\nIDs au format P1-T01, jalons au format P1-J1. Puis les points de vigilance en liste.',
        en: 'A single Markdown table with the columns:\n| ID | Phase | Type (Milestone/Task) | Title | Deliverable | Owner | Duration (d) | Depends on |\nIDs formatted P1-T01, milestones formatted P1-M1. Then the points of attention as a list.',
        when: formatIs('TABLEAU')
      },
      {
        fr: 'Une arborescence Phase > Jalon / Tâche, une tâche par ligne :\n« ID — Intitulé (durée, responsable) ← dépendances ».\nPuis les points de vigilance.',
        en: 'A tree Phase > Milestone / Task, one task per line:\n"ID — Title (duration, owner) ← dependencies".\nThen the points of attention.',
        when: formatIs('LISTE')
      },
      csvFormat(
        { fr: 'id;phase;type;intitule;livrable;responsable;duree_jours;depend_de', en: 'id;phase;type;title;deliverable;owner;duration_days;depends_on' },
        { fr: 'Plusieurs dépendances sont séparées par « , ».', en: 'Multiple dependencies are separated by ",".' }
      ),
      jsonFormat({
        fr: '{"objectif": "", "hypotheses": [], "phases": [{"id": "", "nom": "", "jalons": [{"id": "", "intitule": "", "critere_validation": ""}], "taches": [{"id": "", "intitule": "", "livrable": "", "responsable": "", "duree_jours": 0, "depend_de": []}]}], "vigilance": []}',
        en: '{"objective": "", "assumptions": [], "phases": [{"id": "", "name": "", "milestones": [{"id": "", "title": "", "approval_criterion": ""}], "tasks": [{"id": "", "title": "", "deliverable": "", "owner": "", "duration_days": 0, "depends_on": []}]}], "attention_points": []}'
      })
    ],
    constraints: [
      {
        fr: '- Aucune tâche de plus de 10 jours : découpe-la.',
        en: '- No task longer than 10 days: split it.',
        when: is('GRANULARITE', 'standard')
      },
      {
        fr: '- Aucune tâche de plus d\'une journée : découpe-la.',
        en: '- No task longer than one day: split it.',
        when: is('GRANULARITE', 'fine')
      },
      {
        fr: '- Les dépendances pointent vers des IDs existants, sans boucle.',
        en: '- Dependencies point to existing IDs, with no loops.',
        when: isNot('GRANULARITE', 'macro')
      },
      {
        fr: '- Vérifie que l\'enchaînement le plus long respecte l\'échéance ({{ECHEANCE}}) ; sinon, signale l\'écart et propose des leviers.',
        en: '- Check that the longest sequence meets the deadline ({{ECHEANCE}}); if not, flag the gap and suggest levers.',
        when: all(filled('ECHEANCE'), formatIsNot('CSV'))
      },
      {
        fr: '- Le planning doit tenir avant l\'échéance ({{ECHEANCE}}) : ajuste les durées ou la parallélisation en conséquence.',
        en: '- The schedule must fit before the deadline ({{ECHEANCE}}): adjust durations or parallel work accordingly.',
        when: all(filled('ECHEANCE'), formatIs('CSV'))
      }
    ],
    quality: [
      { fr: '- [ ] Chaque tâche commence par un verbe et a un livrable identifiable.', en: '- [ ] Every task starts with a verb and has an identifiable deliverable.', when: isNot('GRANULARITE', 'macro') },
      { fr: '- [ ] Chaque phase se termine par un jalon de validation.', en: '- [ ] Every phase ends with an approval milestone.' },
      { fr: '- [ ] Les tâches transverses sont présentes (pilotage, recette, mise en production).', en: '- [ ] Cross-cutting tasks are included (management, acceptance testing, go-live).' },
      strictFormatCheck()
    ]
  }
}
