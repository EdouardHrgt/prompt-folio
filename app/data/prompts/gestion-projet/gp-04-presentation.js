/**
 * GP-04 — Présentation de projet (cadrage, lancement, go/no-go).
 * Les notes de projet sont découpées en sous-champs guidés plutôt qu'une grande zone de texte.
 */
export default {
  id: 'gp-04',
  domain: 'gestion-projet',
  version: '1.0.0',
  slug: { fr: 'presentation-projet', en: 'project-presentation' },
  title: { fr: 'Présenter un projet', en: 'Present a project' },
  summary: {
    fr: 'Une présentation claire et convaincante, adaptée à votre public, avec les notes orateur.',
    en: 'A clear, convincing presentation tailored to your audience, with speaker notes.'
  },

  roles: ['consultant-strategie', 'chef-projet-senior', 'directeur-programme', 'pmo'],
  defaultRole: 'consultant-strategie',
  modes: ['FACTUEL', 'MIXTE', 'CREATIF'],
  formats: ['SLIDES', 'TEXTE', 'LISTE'],
  defaults: { MODE: 'MIXTE', FORMAT: 'SLIDES', INFOS: 'standard', PREVIEW: true, CITATIONS: true, AUDACE: 2 },
  response: { audace: true, public: 'required', longueur: false, tons: ['direct', 'formel', 'inspirant'] },

  fields: [
    {
      key: 'OBJECTIF_PRESENTATION',
      type: 'text',
      required: true,
      default: '',
      label: { fr: 'Ce que la présentation doit obtenir', en: 'What the presentation must achieve' },
      placeholder: { fr: 'Ex. : obtenir le go et 80 k€ de budget', en: 'E.g. get the go-ahead and a €80k budget' }
    },
    {
      key: 'DUREE',
      type: 'chips',
      required: true,
      default: '15',
      label: { fr: 'Temps de parole', en: 'Speaking time' },
      options: ['5', '10', '15', '20', '30', '45'].map(n => ({ value: n, label: { fr: `${n} min`, en: `${n} min` }, prompt: { fr: `${n} minutes`, en: `${n} minutes` } }))
    },
    {
      key: 'NB_SLIDES',
      type: 'slider',
      required: true,
      default: 10,
      min: 4,
      max: 25,
      label: { fr: 'Nombre de slides visé', en: 'Target number of slides' },
      showIf: v => v.FORMAT === 'SLIDES'
    },
    { key: 'CONTEXTE_PROBLEME', type: 'textarea', required: true, default: '', group: 'notes', label: { fr: 'Contexte et problème', en: 'Context and problem' }, placeholder: { fr: 'Pourquoi ce projet ? Quelle situation actuelle ?', en: 'Why this project? What is the current situation?' } },
    { key: 'SOLUTION', type: 'textarea', required: true, default: '', group: 'notes', label: { fr: 'Solution proposée', en: 'Proposed solution' } },
    { key: 'BENEFICES', type: 'textarea', required: false, default: '', group: 'notes', label: { fr: 'Bénéfices attendus', en: 'Expected benefits' }, placeholder: { fr: 'Gains chiffrés si possible', en: 'Quantified gains if possible' } },
    { key: 'PLANNING', type: 'textarea', required: false, default: '', group: 'notes', label: { fr: 'Planning et jalons', en: 'Timeline and milestones' } },
    { key: 'BUDGET_RESSOURCES', type: 'textarea', required: false, default: '', group: 'notes', label: { fr: 'Budget et ressources', en: 'Budget and resources' } },
    { key: 'EQUIPE', type: 'text', required: false, default: '', group: 'notes', label: { fr: 'Équipe', en: 'Team' } },
    { key: 'RISQUES', type: 'textarea', required: false, default: '', group: 'notes', label: { fr: 'Risques identifiés', en: 'Identified risks' } },
    { key: 'AUTRES_NOTES', type: 'textarea', required: false, default: '', group: 'notes', label: { fr: 'Autres notes', en: 'Other notes' } }
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta spécialité ici : présenter un projet pour obtenir une décision. Tu structures selon le principe de la pyramide (la conclusion d\'abord) et tu adaptes chaque message aux préoccupations du public.',
      en: 'Your speciality here: presenting a project to obtain a decision. You structure according to the pyramid principle (conclusion first) and tailor every message to the audience\'s concerns.'
    },
    context: [
      {
        fr: 'Je présente le projet décrit dans <notes_projet>.\nObjectif de la présentation : {{OBJECTIF_PRESENTATION}}.\nTemps de parole : {{DUREE}}.',
        en: 'I am presenting the project described in <project_notes>.\nPresentation goal: {{OBJECTIF_PRESENTATION}}.\nSpeaking time: {{DUREE}}.'
      },
      { fr: 'Nombre de slides visé : {{NB_SLIDES}}.', en: 'Target number of slides: {{NB_SLIDES}}.', when: v => v.FORMAT === 'SLIDES' }
    ],
    data: [
      {
        tag: { fr: 'notes_projet', en: 'project_notes' },
        items: [
          { key: 'CONTEXTE_PROBLEME', label: { fr: 'Contexte et problème', en: 'Context and problem' } },
          { key: 'SOLUTION', label: { fr: 'Solution proposée', en: 'Proposed solution' } },
          { key: 'BENEFICES', label: { fr: 'Bénéfices attendus', en: 'Expected benefits' } },
          { key: 'PLANNING', label: { fr: 'Planning et jalons', en: 'Timeline and milestones' } },
          { key: 'BUDGET_RESSOURCES', label: { fr: 'Budget et ressources', en: 'Budget and resources' } },
          { key: 'EQUIPE', label: { fr: 'Équipe', en: 'Team' } },
          { key: 'RISQUES', label: { fr: 'Risques identifiés', en: 'Identified risks' } },
          { key: 'AUTRES_NOTES', label: { fr: 'Autres notes', en: 'Other notes' } }
        ]
      }
    ],
    task: [
      { fr: '1. Identifie les 3 questions que le destinataire se posera en priorité, et assure-toi que la présentation y répond.', en: '1. Identify the 3 questions the audience will ask first, and make sure the presentation answers them.' },
      { fr: '2. Formule le message clé en une phrase (ce que le public doit retenir et décider).', en: '2. State the key message in one sentence (what the audience must remember and decide).' },
      {
        fr: '3. Construis le déroulé : accroche / problème → enjeux chiffrés → solution proposée → bénéfices → planning et jalons → budget et ressources → risques et parades → demande explicite et prochaines étapes. Adapte l\'ordre si le public l\'exige.',
        en: '3. Build the storyline: hook / problem → quantified stakes → proposed solution → benefits → timeline and milestones → budget and resources → risks and mitigations → explicit request and next steps. Adapt the order if the audience requires it.'
      },
      {
        fr: '4. Pour chaque slide : un titre-message (une phrase affirmative, pas un simple thème), 3 à 5 points, un visuel suggéré, une note orateur.',
        en: '4. For each slide: an action title (an affirmative sentence, not just a topic), 3 to 5 points, a suggested visual, a speaker note.',
        when: v => v.FORMAT !== 'TEXTE'
      },
      { fr: '5. Prépare 3 questions difficiles probables avec une réponse courte pour chacune.', en: '5. Prepare 3 likely tough questions with a short answer for each.' }
    ],
    mode: [
      {
        fr: '- N\'utilise que les informations des notes et des sources : aucun chiffre inventé. Écris [INFO MANQUANTE : …] là où un élément attendu manque.',
        en: '- Only use information from the notes and sources: no invented figures. Write [MISSING INFO: …] where an expected element is missing.',
        when: v => v.MODE === 'FACTUEL'
      },
      {
        fr: '- Chiffres et faits strictement issus des notes et des sources. Formulations, accroches, analogies et visuels créatifs autorisés (audace {{AUDACE}}/5), étiquetés [PROPOSITION] s\'ils ajoutent du contenu.',
        en: '- Figures and facts strictly from the notes and sources. Creative wording, hooks, analogies and visuals are allowed (boldness {{AUDACE}}/5), labelled [SUGGESTION] when they add content.',
        when: v => v.MODE === 'MIXTE'
      },
      {
        fr: '- Construis une narration marquante (storytelling, scénario utilisateur, contraste avant / après), avec une audace de {{AUDACE}}/5 (1 = sobre, 5 = très marquant), sans jamais altérer les chiffres.',
        en: '- Build a striking narrative (storytelling, user scenario, before / after contrast) with boldness {{AUDACE}}/5 (1 = understated, 5 = very striking), without ever altering the figures.',
        when: v => v.MODE === 'CREATIF'
      }
    ],
    format: [
      {
        fr: 'Commence par « Message clé » et « Les 3 questions du public ».',
        en: 'Start with "Key message" and "The audience\'s 3 questions".'
      },
      {
        fr: 'Pour chaque slide :\nSlide N — [Titre-message]\n• point 1 … (3 à 5 points)\nVisuel : [suggestion]\nNote orateur : [2 à 4 phrases, durée indicative]',
        en: 'For each slide:\nSlide N — [Action title]\n• point 1 … (3 to 5 points)\nVisual: [suggestion]\nSpeaker note: [2 to 4 sentences, indicative timing]',
        when: v => v.FORMAT === 'SLIDES'
      },
      {
        fr: 'Une note de présentation rédigée, une section par étape du déroulé, prête à envoyer en pré-lecture.',
        en: 'A written briefing note, one section per storyline step, ready to send as pre-reading.',
        when: v => v.FORMAT === 'TEXTE'
      },
      {
        fr: 'Un plan hiérarchique slide par slide (titres et points seulement).',
        en: 'A hierarchical outline, slide by slide (titles and points only).',
        when: v => v.FORMAT === 'LISTE'
      },
      { fr: 'Termine par « Questions difficiles et réponses ».', en: 'End with "Tough questions and answers".' }
    ],
    constraints: [
      { fr: '- Une idée par slide, pas plus de 30 mots par slide hors note orateur.', en: '- One idea per slide, no more than 30 words per slide excluding the speaker note.', when: v => v.FORMAT !== 'TEXTE' },
      { fr: '- Respecte le nombre de slides visé à ±2 près.', en: '- Stay within ±2 of the target number of slides.', when: v => v.FORMAT === 'SLIDES' },
      { fr: '- La conclusion formule une demande explicite (décision, budget, ressources, date).', en: '- The conclusion makes an explicit request (decision, budget, resources, date).' }
    ],
    quality: [
      { fr: '- [ ] En lisant seulement les titres, on comprend toute l\'argumentation.', en: '- [ ] Reading only the titles, the whole argument is clear.' },
      { fr: '- [ ] Les 3 questions du public trouvent une réponse.', en: '- [ ] The audience\'s 3 questions are answered.' },
      { fr: '- [ ] Aucun chiffre n\'est présent sans provenir des notes ou d\'une source consultée.', en: '- [ ] No figure appears unless it comes from the notes or a consulted source.' }
    ]
  }
}
