/**
 * VT-01 — Argumentaire de vente personnalisé.
 * La dernière étape s'adapte au canal : pitch oral, email prêt à envoyer ou résumé d'appel d'offres.
 */
import { F } from '../fields.js'
import { SALES } from './fields.js'
import { filled, formatIs, is, isNot, missing, modeIs } from '../helpers.js'

const b2c = is('TYPE_CLIENT', 'b2c')

const CANAUX = [
  { value: 'decouverte', label: { fr: 'RDV de découverte', en: 'Discovery meeting' }, prompt: { fr: 'lors d\'un rendez-vous de découverte', en: 'during a discovery meeting' } },
  { value: 'appel', label: { fr: 'Appel', en: 'Phone call' }, prompt: { fr: 'lors d\'un appel téléphonique', en: 'during a phone call' } },
  { value: 'demo', label: { fr: 'Démonstration', en: 'Demo' }, prompt: { fr: 'lors d\'une démonstration', en: 'during a product demo' } },
  { value: 'salon', label: { fr: 'Salon / événement', en: 'Trade show / event' }, prompt: { fr: 'lors d\'un échange sur un salon ou un événement', en: 'during a conversation at a trade show or event' } },
  { value: 'email', label: { fr: 'Email', en: 'Email' }, prompt: { fr: 'par un email de prospection', en: 'through a prospecting email' } },
  { value: 'ao', label: { fr: 'Appel d\'offres', en: 'Tender' }, prompt: { fr: 'dans une réponse à un appel d\'offres', en: 'in a tender response' } }
]

// Canaux écrits : pas de questions de découverte ni de pitch oral.
const ecrit = is('CANAL', 'email', 'ao')
const oral = isNot('CANAL', 'email', 'ao')

export default {
  id: 'vt-01',
  domain: 'vente',
  version: '1.0.0',
  slug: { fr: 'argumentaire-de-vente', en: 'sales-pitch' },
  title: { fr: 'Construire un argumentaire de vente', en: 'Build a sales pitch' },
  summary: {
    fr: 'Proposition de valeur, arguments appuyés sur vos preuves, objections et pitch, adaptés à votre interlocuteur.',
    en: 'Value proposition, proof-backed arguments, objections and pitch, tailored to your contact.'
  },

  roles: ['business-developer', 'conseiller-vente', 'key-account-manager', 'avant-vente', 'coach-commercial'],
  defaultRole: 'business-developer',
  modes: ['FACTUEL', 'MIXTE', 'CREATIF'],
  formats: ['TABLEAU', 'TEXTE', 'LISTE', 'SLIDES'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TABLEAU', INFOS: 'standard', PREVIEW: false, CITATIONS: true, AUDACE: 2, POSTURE: 'client' },
  response: { audace: true, public: false, longueur: false, tons: ['consultatif', 'direct', 'enthousiaste', 'premium'] },

  fields: [
    F.choice('chips', 'CANAL', { fr: 'Où allez-vous l\'utiliser ?', en: 'Where will you use it?' }, CANAUX),
    SALES.offerName({ group: 'offre' }),
    SALES.offerDescription({ group: 'offre' }),
    SALES.price({ group: 'offre' }),
    SALES.differentiators({ group: 'offre' }),
    SALES.clientType({ group: 'cible' }),
    SALES.contact({ group: 'cible' }),
    SALES.profile({ group: 'cible' }),
    SALES.companySize({ group: 'cible' }),
    SALES.stakes({ group: 'cible' }),
    SALES.proofs(),
    SALES.competitors(),
    F.tags('OBJECTIONS', { fr: 'Objections déjà entendues', en: 'Objections already heard' }, {
      advanced: true,
      placeholder: { fr: 'Ex. : trop cher', en: 'E.g. too expensive' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta spécialité ici : construire un argumentaire sur mesure. Tu relies chaque argument à un enjeu de l\'interlocuteur et tu ne promets rien que l\'offre ne puisse prouver.',
      en: 'Your speciality here: building a tailored sales pitch. You tie every argument to one of the contact\'s stakes and promise nothing the offer cannot prove.'
    },
    context: [
      {
        fr: 'Je dois convaincre l\'interlocuteur décrit dans <cible> avec l\'offre décrite dans <offre>, {{CANAL}}.',
        en: 'I need to convince the contact described in <target> with the offer described in <offer>, {{CANAL}}.'
      }
    ],
    data: [
      { tag: { fr: 'offre', en: 'offer' }, items: ['NOM_OFFRE', 'OFFRE', 'PRIX', 'DIFFERENCIANTS'] },
      { tag: { fr: 'cible', en: 'target' }, items: ['TYPE_CLIENT', 'INTERLOCUTEUR', 'PROFIL_CLIENT', 'TAILLE_CIBLE', 'ENJEUX'] },
      { tag: { fr: 'preuves', en: 'proof' }, items: [{ key: 'PREUVES', render: SALES.renderProofs }] },
      { tag: { fr: 'concurrence', en: 'competition' }, items: ['CONCURRENTS', 'OBJECTIONS'] }
    ],
    task: [
      {
        fr: '1. Dresse le profil de l\'interlocuteur : ses 3 enjeux ou difficultés prioritaires (en partant de ceux fournis), ses critères de décision, ce qu\'il risque à ne rien changer.',
        en: '1. Profile the contact: their 3 top stakes or pain points (starting from those provided), their decision criteria, what they risk by changing nothing.'
      },
      {
        fr: '2. Formule la proposition de valeur en une phrase : « Pour [cible] qui [problème], [offre] permet de [bénéfice clé], contrairement à [alternative] ».',
        en: '2. State the value proposition in one sentence: "For [target] who [problem], [offer] lets them [key benefit], unlike [alternative]".'
      },
      {
        fr: '3. Construis 4 à 6 arguments selon la méthode CAB (Caractéristique → Avantage → Bénéfice pour l\'interlocuteur), chacun relié à un enjeu de l\'étape 1 et appuyé par une preuve fournie quand il y en a une.',
        en: '3. Build 4 to 6 arguments using the FAB method (Feature → Advantage → Benefit for the contact), each tied to a stake from step 1 and backed by a provided proof point when there is one.'
      },
      {
        fr: '4. Prépare 5 questions de découverte selon la méthode SPIN (situation, problème, implication, bénéfice attendu).',
        en: '4. Prepare 5 discovery questions using the SPIN method (situation, problem, implication, need-payoff).',
        when: oral
      },
      {
        fr: '5. Anticipe les 5 objections les plus probables (prix, timing, concurrent, risque, statu quo) et réponds à chacune en 3 temps : reformuler, répondre, vérifier.',
        en: '5. Anticipate the 5 most likely objections (price, timing, competitor, risk, status quo) and answer each in 3 moves: rephrase, respond, check.',
        when: missing('OBJECTIONS')
      },
      {
        fr: '5. Traite d\'abord les objections déjà entendues, puis complète jusqu\'à 5 objections probables (prix, timing, concurrent, risque, statu quo). Réponds à chacune en 3 temps : reformuler, répondre, vérifier.',
        en: '5. Handle the objections already heard first, then add likely ones up to 5 (price, timing, competitor, risk, status quo). Answer each in 3 moves: rephrase, respond, check.',
        when: filled('OBJECTIONS')
      },
      {
        fr: '6. Rédige un pitch de 30 secondes (75 mots au maximum) et une phrase de conclusion qui propose une prochaine étape précise.',
        en: '6. Write a 30-second pitch (75 words at most) and a closing sentence that proposes a specific next step.',
        when: oral
      },
      {
        fr: '6. Rédige l\'email prêt à envoyer : un objet de 8 mots au maximum, un corps de 150 mots au maximum centré sur un enjeu de l\'interlocuteur, et une demande de rendez-vous précise.',
        en: '6. Write the ready-to-send email: a subject line of 8 words at most, a body of 150 words at most built around one of the contact\'s stakes, and a specific meeting request.',
        when: is('CANAL', 'email')
      },
      {
        fr: '6. Rédige un résumé exécutif de 150 mots au maximum pour le mémoire de réponse, qui reprend la proposition de valeur et les 3 arguments les plus forts.',
        en: '6. Write an executive summary of 150 words at most for the tender response, restating the value proposition and the 3 strongest arguments.',
        when: is('CANAL', 'ao')
      }
    ],
    mode: [
      {
        fr: '- N\'utilise que l\'offre, les preuves et les sources : aucune statistique, référence client ou étude inventée. Écris [PREUVE À FOURNIR] là où un argument en aurait besoin.',
        en: '- Only use the offer, the proof points and the sources: no invented statistic, client reference or study. Write [PROOF NEEDED] where an argument would need one.',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Faits et preuves strictement issus des données et des sources. Formulations, analogies et accroches créatives libres (audace {{AUDACE}}/5). Toute estimation chiffrée de ta part est étiquetée [ESTIMATION À VALIDER].',
        en: '- Facts and proof points strictly from the data and sources. Free creative wording, analogies and hooks (boldness {{AUDACE}}/5). Any figure you estimate yourself is labelled [ESTIMATE TO CONFIRM].',
        when: modeIs('MIXTE')
      },
      {
        fr: '- Comme en mode équilibré, et propose en plus un angle d\'attaque inattendu (récit, recadrage du problème, provocation maîtrisée) avec une audace de {{AUDACE}}/5 (1 = sobre, 5 = très marquant), sans jamais inventer de preuve.',
        en: '- As in balanced mode, and also suggest an unexpected angle (story, reframing the problem, controlled provocation) with boldness {{AUDACE}}/5 (1 = understated, 5 = very striking), without ever inventing proof.',
        when: modeIs('CREATIF')
      }
    ],
    format: [
      { fr: 'Une section par étape de la tâche, dans l\'ordre, avec un intitulé court.', en: 'One section per task step, in order, with a short heading.', when: formatIs('TABLEAU', 'TEXTE', 'LISTE') },
      {
        fr: 'Arguments en tableau :\n| Caractéristique | Avantage | Bénéfice pour l\'interlocuteur | Enjeu adressé | Preuve |\nObjections en tableau :\n| Objection | Reformulation | Réponse | Question de vérification |\nLe reste en listes courtes.',
        en: 'Arguments as a table:\n| Feature | Advantage | Benefit for the contact | Stake addressed | Proof |\nObjections as a table:\n| Objection | Rephrasing | Response | Check question |\nEverything else as short lists.',
        when: formatIs('TABLEAU')
      },
      { fr: 'Un guide rédigé, prêt à relire juste avant l\'échange.', en: 'A written guide, ready to reread just before the conversation.', when: formatIs('TEXTE') },
      { fr: 'Une fiche réflexe : une ligne par élément, lisible en 2 minutes.', en: 'A cheat sheet: one line per item, readable in 2 minutes.', when: formatIs('LISTE') },
      {
        fr: '6 slides à montrer à l\'interlocuteur. Pour chaque slide :\nSlide N — [Titre-message]\n• point 1 … (3 à 5 points)\nVisuel : [suggestion]\nPuis une « Annexe interne » à ne pas projeter : profil de l\'interlocuteur et objections, avec les questions de découverte si elles sont prévues.',
        en: '6 slides to show the contact. For each slide:\nSlide N — [Action title]\n• point 1 … (3 to 5 points)\nVisual: [suggestion]\nThen an "Internal appendix" not to be shown: contact profile and objections, with the discovery questions if any.',
        when: formatIs('SLIDES')
      }
    ],
    constraints: [
      { fr: '- Aucun dénigrement nominatif d\'un concurrent : compare des approches, pas des marques.', en: '- No disparaging a named competitor: compare approaches, not brands.' },
      { fr: '- Pas de formules creuses (« solution innovante », « leader du marché ») sans preuve.', en: '- No empty claims ("innovative solution", "market leader") without proof.' },
      { fr: '- Les bénéfices s\'expriment du point de vue de l\'interlocuteur : temps, argent, risque, image.', en: '- Benefits are expressed from the contact\'s point of view: time, money, risk, image.' },
      {
        fr: '- Client particulier : parle de son projet et de son quotidien, pas de rentabilité ni de jargon professionnel. Aucune pression ni fausse urgence ; rappelle ses droits (délai de rétractation, conditions de financement) quand ils s\'appliquent.',
        en: '- Consumer client: talk about their project and daily life, not return on investment or business jargon. No pressure or false urgency; mention their rights (cooling-off period, financing conditions) where they apply.',
        when: b2c
      }
    ],
    quality: [
      { fr: '- [ ] Chaque argument répond à un enjeu de l\'interlocuteur, pas seulement à une fonctionnalité.', en: '- [ ] Every argument addresses one of the contact\'s stakes, not just a feature.' },
      { fr: '- [ ] Le pitch tient en 30 secondes à l\'oral.', en: '- [ ] The pitch fits in 30 seconds when spoken.', when: oral },
      { fr: '- [ ] Les limites de mots de l\'email ou du résumé sont respectées.', en: '- [ ] The word limits of the email or summary are met.', when: ecrit },
      { fr: '- [ ] Aucune preuve ni aucun chiffre n\'a été inventé.', en: '- [ ] No proof point or figure has been invented.' },
      { fr: '- [ ] Les objections déjà entendues sont toutes traitées.', en: '- [ ] Every objection already heard is handled.', when: filled('OBJECTIONS') }
    ]
  }
}
