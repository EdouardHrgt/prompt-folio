/**
 * VT-05 — Séquence de prospection (email, LinkedIn ou multicanale).
 * Reprend l'offre, l'interlocuteur et les preuves de VT-01 ; ajoute les règles RGPD selon la cible.
 */
import { F } from '../fields.js'
import { SALES } from './fields.js'
import { csvFormat, formatIs, is, isNot, modeIs, strictFormatCheck } from '../helpers.js'

const CANAUX = [
  { value: 'email', label: { fr: 'Email', en: 'Email' }, prompt: { fr: 'par email', en: 'by email' } },
  { value: 'linkedin', label: { fr: 'LinkedIn', en: 'LinkedIn' }, prompt: { fr: 'sur LinkedIn', en: 'on LinkedIn' } },
  { value: 'mixte', label: { fr: 'Mixte (email, LinkedIn, appel)', en: 'Mixed (email, LinkedIn, call)' }, prompt: { fr: 'en combinant email, LinkedIn et appel', en: 'combining email, LinkedIn and phone' } }
]

const RYTHMES = [
  { value: 'serre', label: { fr: 'Serré', en: 'Tight' }, hint: { fr: '2 à 3 jours entre deux messages', en: '2 to 3 days between messages' }, prompt: { fr: '2 à 3 jours', en: '2 to 3 days' } },
  { value: 'standard', label: { fr: 'Standard', en: 'Standard' }, hint: { fr: '4 à 5 jours entre deux messages', en: '4 to 5 days between messages' }, prompt: { fr: '4 à 5 jours', en: '4 to 5 days' } },
  { value: 'espace', label: { fr: 'Espacé', en: 'Spaced out' }, hint: { fr: 'Une semaine entre deux messages', en: 'A week between messages' }, prompt: { fr: 'une semaine', en: 'a week' } }
]

const OBJECTIFS = [
  { value: 'rdv', label: { fr: 'Un rendez-vous', en: 'A meeting' }, prompt: { fr: 'obtenir un rendez-vous', en: 'book a meeting' } },
  { value: 'demo', label: { fr: 'Une démo', en: 'A demo' }, prompt: { fr: 'obtenir une démonstration', en: 'book a demo' } },
  { value: 'reponse', label: { fr: 'Une réponse', en: 'A reply' }, prompt: { fr: 'obtenir une réponse, même négative', en: 'get a reply, even a no' } },
  { value: 'evenement', label: { fr: 'Une inscription', en: 'A sign-up' }, prompt: { fr: 'obtenir une inscription à un événement', en: 'get a sign-up to an event' } }
]

const b2c = is('TYPE_CLIENT', 'b2c')
const email = is('CANAL_SEQ', 'email', 'mixte')

export default {
  id: 'vt-05',
  domain: 'vente',
  version: '1.0.0',
  slug: { fr: 'sequence-de-prospection', en: 'prospecting-sequence' },
  title: { fr: 'Écrire une séquence de prospection', en: 'Write a prospecting sequence' },
  summary: {
    fr: 'Email, LinkedIn ou multicanale : un premier message personnel et des relances qui apportent chacune un angle neuf.',
    en: 'Email, LinkedIn or multichannel: a personal first message and follow-ups that each bring a fresh angle.'
  },

  roles: ['sdr', 'business-developer', 'coach-commercial'],
  defaultRole: 'sdr',
  modes: ['FACTUEL', 'MIXTE', 'CREATIF'],
  formats: ['TABLEAU', 'TEXTE', 'CSV'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TABLEAU', INFOS: 'standard', PREVIEW: false, CITATIONS: false, AUDACE: 2, POSTURE: 'client' },
  response: { audace: true, public: false, longueur: false, tons: ['direct', 'consultatif', 'enthousiaste'] },

  fields: [
    F.choice('chips', 'CANAL_SEQ', { fr: 'Canal', en: 'Channel' }, CANAUX),
    F.choice('chips', 'OBJECTIF_SEQ', { fr: 'Ce que vous voulez obtenir', en: 'What you want to get' }, OBJECTIFS),
    F.slider('NB_MESSAGES', { fr: 'Nombre de messages', en: 'Number of messages' }, { min: 3, max: 6, default: 4 }),
    F.choice('segmented', 'RYTHME', { fr: 'Espacement', en: 'Spacing' }, RYTHMES, { default: 'standard' }),
    SALES.offerName({ group: 'offre' }),
    SALES.offerDescription({ group: 'offre' }),
    SALES.differentiators({ group: 'offre' }),
    SALES.clientType({ group: 'cible' }),
    SALES.contact({ group: 'cible' }),
    SALES.profile({ group: 'cible' }),
    SALES.companySize({ group: 'cible' }),
    SALES.stakes({ group: 'cible' }),
    F.textarea('CONTEXTE_PROSPECT', { fr: 'Ce que vous savez du prospect', en: 'What you know about the prospect' }, {
      promptLabel: { fr: 'Ce que je sais du prospect', en: 'What I know about the prospect' },
      help: {
        fr: 'Actualité, publication récente, recrutement, ouverture d\'un site… C\'est ce qui rend le premier message personnel.',
        en: 'News, a recent post, hiring, a new site opening… This is what makes the first message personal.'
      }
    }),
    SALES.proofs()
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : écrire une séquence qui obtient des réponses sans agacer, avec des messages courts, personnels, et chacun une raison d\'être.',
      en: 'Your mission: write a sequence that gets replies without annoying, with short, personal messages that each have a reason to exist.'
    },
    context: [
      {
        fr: 'Je prospecte l\'interlocuteur décrit dans <cible> pour l\'offre décrite dans <offre>, {{CANAL_SEQ}}. Objectif : {{OBJECTIF_SEQ}}.',
        en: 'I am prospecting the contact described in <target> for the offer described in <offer>, {{CANAL_SEQ}}. Goal: {{OBJECTIF_SEQ}}.'
      }
    ],
    data: [
      { tag: { fr: 'offre', en: 'offer' }, items: ['NOM_OFFRE', 'OFFRE', 'DIFFERENCIANTS'] },
      { tag: { fr: 'cible', en: 'target' }, items: ['TYPE_CLIENT', 'INTERLOCUTEUR', 'PROFIL_CLIENT', 'TAILLE_CIBLE', 'ENJEUX', 'CONTEXTE_PROSPECT'] },
      { tag: { fr: 'preuves', en: 'proof' }, items: [{ key: 'PREUVES', render: SALES.renderProofs }] }
    ],
    task: [
      {
        fr: '1. Choisis l\'angle d\'attaque : l\'enjeu le plus susceptible de faire répondre l\'interlocuteur, en t\'appuyant sur ce que l\'on sait du prospect.',
        en: '1. Choose the angle: the stake most likely to get the contact to reply, based on what is known about the prospect.'
      },
      {
        fr: '2. Rédige une séquence de {{NB_MESSAGES}} messages espacés de {{RYTHME}}. Pour chacun : le jour (J+0, J+3…), le canal, l\'objet pour un email (6 mots au maximum), le corps et un seul appel à l\'action.',
        en: '2. Write a sequence of {{NB_MESSAGES}} messages spaced {{RYTHME}} apart. For each: the day (D+0, D+3…), the channel, the subject line for an email (6 words at most), the body and a single call to action.'
      },
      {
        fr: '3. Premier message : 80 mots au maximum, personnalisé dès la première phrase, sans présenter l\'entreprise en ouverture.',
        en: '3. First message: 80 words at most, personal from the first sentence, without opening with a company introduction.'
      },
      {
        fr: '4. Relances : chacune apporte un angle neuf (une preuve, une question, une ressource utile, un cas client) au lieu de simplement « relancer ».',
        en: '4. Follow-ups: each brings a fresh angle (a proof point, a question, a useful resource, a client case) instead of just "following up".'
      },
      {
        fr: '5. Dernier message : une clôture polie qui laisse la porte ouverte, sans culpabiliser.',
        en: '5. Last message: a polite close that leaves the door open, without guilt-tripping.'
      },
      {
        fr: '6. Sur LinkedIn, la demande de connexion tient en 300 caractères et ne vend rien.',
        en: '6. On LinkedIn, the connection request fits in 300 characters and sells nothing.',
        when: isNot('CANAL_SEQ', 'email')
      },
      {
        fr: '7. Pour l\'appel, fournis un script de 4 phrases et un message vocal de 20 secondes.',
        en: '7. For the call, provide a 4-sentence script and a 20-second voicemail.',
        when: is('CANAL_SEQ', 'mixte')
      }
    ],
    mode: [
      {
        fr: '- N\'utilise que l\'offre, les preuves et ce que l\'on sait du prospect : aucun chiffre, client ou actualité inventé. Écris [À PERSONNALISER : …] là où une information manque.',
        en: '- Only use the offer, the proof points and what is known about the prospect: no invented figure, client or news. Write [TO PERSONALISE: …] where information is missing.',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Faits et preuves strictement issus des données. Accroches et formulations libres (audace {{AUDACE}}/5). Toute supposition sur le prospect est étiquetée [À VÉRIFIER].',
        en: '- Facts and proof points strictly from the data. Free hooks and wording (boldness {{AUDACE}}/5). Any assumption about the prospect is labelled [TO CHECK].',
        when: modeIs('MIXTE')
      },
      {
        fr: '- Comme en mode équilibré, avec des accroches plus surprenantes (audace {{AUDACE}}/5 : 1 = sobre, 5 = très marquant), sans jamais inventer de preuve.',
        en: '- As in balanced mode, with more surprising hooks (boldness {{AUDACE}}/5: 1 = understated, 5 = very striking), without ever inventing proof.',
        when: modeIs('CREATIF')
      }
    ],
    format: [
      {
        fr: 'Commence par l\'angle d\'attaque en une phrase, puis la séquence en tableau :\n| Jour | Canal | Objet | Message | Appel à l\'action |',
        en: 'Start with the angle in one sentence, then the sequence as a table:\n| Day | Channel | Subject | Message | Call to action |',
        when: formatIs('TABLEAU')
      },
      {
        fr: 'Commence par l\'angle d\'attaque en une phrase, puis les messages dans l\'ordre, chacun précédé de son jour et de son canal, prêts à copier.',
        en: 'Start with the angle in one sentence, then the messages in order, each preceded by its day and channel, ready to copy.',
        when: formatIs('TEXTE')
      },
      csvFormat(
        { fr: 'Etape;Jour;Canal;Objet;Message;Appel_action', en: 'Step;Day;Channel;Subject;Message;Call_to_action' },
        { fr: 'Un message par ligne, champ Message entre guillemets doubles.', en: 'One message per row, Message field in double quotes.' }
      )
    ],
    constraints: [
      { fr: '- Aucune fausse familiarité, aucun faux prétexte (« suite à notre échange », « comme convenu ») ni fausse urgence.', en: '- No false familiarity, no false pretext ("following our conversation", "as agreed") and no false urgency.' },
      { fr: '- Chaque email se termine par une ligne permettant de ne plus être contacté.', en: '- Every email ends with a line allowing the recipient to opt out.', when: email },
      {
        fr: '- Particuliers : la prospection par email ou message exige leur consentement préalable. Rappelle-le en une ligne en tête de réponse et écris pour des contacts ayant donné leur accord.',
        en: '- Consumers: prospecting them by email or message requires their prior consent. Say so in one line at the top of the answer and write for contacts who have opted in.',
        when: b2c
      },
      {
        fr: '- Professionnels : chaque message doit avoir un rapport avec la fonction de l\'interlocuteur.',
        en: '- Businesses: every message must relate to the contact\'s job.',
        when: isNot('TYPE_CLIENT', 'b2c')
      }
    ],
    quality: [
      { fr: '- [ ] Le premier message ne dépasse pas 80 mots.', en: '- [ ] The first message is no longer than 80 words.' },
      { fr: '- [ ] Chaque relance apporte un élément nouveau.', en: '- [ ] Every follow-up brings something new.' },
      { fr: '- [ ] Aucune preuve ni aucun chiffre n\'a été inventé.', en: '- [ ] No proof point or figure has been invented.' },
      strictFormatCheck(['CSV'])
    ]
  }
}
