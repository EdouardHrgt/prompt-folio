/**
 * RD-01 — Réécrire ou améliorer un texte.
 * Plusieurs objectifs cumulables (choix multiple) ; chacun ajoute sa propre étape et, au besoin, son champ.
 */
import { F } from '../fields.js'
import { PUBLIC_SUGGESTIONS, TONS } from '../common.js'
import { filled, has, hasNot, is, modeIs } from '../helpers.js'

const OBJECTIFS = [
  { value: 'corriger', label: { fr: 'Corriger', en: 'Proofread' }, prompt: { fr: 'corriger', en: 'proofread' } },
  { value: 'raccourcir', label: { fr: 'Raccourcir', en: 'Shorten' }, prompt: { fr: 'raccourcir', en: 'shorten' } },
  { value: 'clarifier', label: { fr: 'Clarifier', en: 'Clarify' }, prompt: { fr: 'clarifier', en: 'clarify' } },
  { value: 'ton', label: { fr: 'Changer de ton', en: 'Change the tone' }, prompt: { fr: 'changer de ton', en: 'change the tone' } },
  { value: 'public', label: { fr: 'Adapter à un public', en: 'Adapt to an audience' }, prompt: { fr: 'adapter à un public', en: 'adapt to an audience' } },
  {
    value: 'traduire',
    label: { fr: 'Traduire', en: 'Translate' },
    hint: { fr: 'Choisissez la langue dans « Votre réponse »', en: 'Pick the language in "Your answer"' },
    prompt: { fr: 'traduire en gardant le style', en: 'translate while keeping the style' }
  }
]

const LONGUEURS_CIBLES = [
  { value: '-25', label: { fr: '25 % plus court', en: '25% shorter' }, prompt: { fr: 'un texte environ 25 % plus court', en: 'a text about 25% shorter' } },
  { value: '-50', label: { fr: 'Moitié moins long', en: 'Half as long' }, prompt: { fr: 'un texte environ deux fois plus court', en: 'a text about half as long' } },
  { value: 'paragraphe', label: { fr: 'Un paragraphe', en: 'One paragraph' }, prompt: { fr: 'un seul paragraphe', en: 'a single paragraph' } },
  { value: 'phrase', label: { fr: 'Une phrase', en: 'One sentence' }, prompt: { fr: 'une seule phrase', en: 'a single sentence' } }
]

const TONS_CIBLES = ['formel', 'neutre', 'direct', 'chaleureux', 'pedagogique', 'persuasif'].map(t => ({ value: t, ...TONS[t] }))

const TYPES_TEXTE = [
  { value: '', label: { fr: 'Non précisé', en: 'Not specified' } },
  { value: 'email', label: { fr: 'Email', en: 'Email' }, prompt: { fr: 'un email', en: 'an email' } },
  { value: 'rapport', label: { fr: 'Rapport / note', en: 'Report / memo' }, prompt: { fr: 'un rapport ou une note', en: 'a report or memo' } },
  { value: 'post', label: { fr: 'Post', en: 'Post' }, prompt: { fr: 'un post pour les réseaux sociaux', en: 'a social media post' } },
  { value: 'web', label: { fr: 'Page web', en: 'Web page' }, prompt: { fr: 'une page web', en: 'a web page' } },
  { value: 'courrier', label: { fr: 'Courrier', en: 'Letter' }, prompt: { fr: 'un courrier', en: 'a letter' } }
]

export default {
  id: 'rd-01',
  domain: 'redaction',
  version: '1.0.0',
  slug: { fr: 'reecrire-un-texte', en: 'rewrite-a-text' },
  title: { fr: 'Réécrire ou améliorer un texte', en: 'Rewrite or improve a text' },
  summary: {
    fr: 'Corriger, raccourcir, clarifier, changer de ton ou traduire, sans trahir le sens ni les faits.',
    en: 'Proofread, shorten, clarify, change the tone or translate, without altering the meaning or the facts.'
  },

  roles: ['editeur', 'charge-communication', 'redacteur-technique'],
  defaultRole: 'editeur',
  modes: ['FACTUEL', 'MIXTE'],
  formats: ['TEXTE'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TEXTE', INFOS: 'ferme', PREVIEW: false, CITATIONS: false },
  response: { audace: false, public: false, longueur: false, tons: null },

  fields: [
    F.textarea('TEXTE_SOURCE', { fr: 'Votre texte', en: 'Your text' }, {
      required: true,
      placeholder: { fr: 'Collez le texte à retravailler.', en: 'Paste the text to rework.' }
    }),
    F.multichoice('OBJECTIFS_REECRITURE', { fr: 'Ce que vous voulez', en: 'What you want' }, OBJECTIFS, {
      required: true,
      default: ['corriger'],
      help: { fr: 'Plusieurs choix possibles.', en: 'You can pick several.' }
    }),
    F.choice('chips', 'LONGUEUR_CIBLE', { fr: 'Longueur visée', en: 'Target length' }, LONGUEURS_CIBLES, { showIf: has('OBJECTIFS_REECRITURE', 'raccourcir') }),
    F.choice('chips', 'TON_CIBLE', { fr: 'Ton voulu', en: 'Desired tone' }, TONS_CIBLES, { showIf: has('OBJECTIFS_REECRITURE', 'ton') }),
    F.combobox('PUBLIC_CIBLE', { fr: 'Public visé', en: 'Target audience' }, {
      required: true,
      showIf: has('OBJECTIFS_REECRITURE', 'public'),
      placeholder: { fr: 'Ex. : clients non techniques', en: 'E.g. non-technical clients' },
      options: PUBLIC_SUGGESTIONS.map(s => ({ value: s.fr, label: s }))
    }),
    F.tags('A_PRESERVER', { fr: 'À ne pas modifier', en: 'Keep unchanged' }, {
      help: { fr: 'Termes techniques, noms propres, chiffres, citations…', en: 'Technical terms, names, figures, quotes…' },
      placeholder: { fr: 'Ex. : Planif\'RH', en: 'E.g. ShiftPro' }
    }),
    F.choice('chips', 'TYPE_TEXTE', { fr: 'Type de texte', en: 'Type of text' }, TYPES_TEXTE, { required: false }),
    F.toggle('EXPLIQUER', { fr: 'Lister les changements importants', en: 'List the main changes' }, {
      default: true,
      help: { fr: 'Désactivez pour n\'obtenir que le texte réécrit.', en: 'Turn off to get only the rewritten text.' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : améliorer le texte fourni sans en trahir le sens ; chaque modification doit servir le lecteur.',
      en: 'Your mission: improve the text provided without altering its meaning; every change must serve the reader.'
    },
    context: [
      { fr: 'Je veux retravailler le texte fourni dans <texte>. Objectifs : {{OBJECTIFS_REECRITURE}}.', en: 'I want to rework the text provided in <text>. Goals: {{OBJECTIFS_REECRITURE}}.' },
      { fr: 'Il s\'agit d\'{{TYPE_TEXTE}}.', en: 'It is {{TYPE_TEXTE}}.', when: filled('TYPE_TEXTE') }
    ],
    data: [
      { tag: { fr: 'texte', en: 'text' }, items: [{ key: 'TEXTE_SOURCE', render: raw => raw.trim() }] },
      { tag: { fr: 'a_preserver', en: 'keep_unchanged' }, items: [{ key: 'A_PRESERVER', render: raw => raw.map(t => `- ${t}`).join('\n') }] }
    ],
    task: [
      {
        fr: '1. Lis le texte en entier et identifie son intention, son lecteur et ses faiblesses avant de modifier quoi que ce soit.',
        en: '1. Read the whole text and identify its purpose, its reader and its weaknesses before changing anything.'
      },
      {
        fr: '2. Corrige l\'orthographe, la grammaire, la ponctuation et les accords, sans changer le style.',
        en: '2. Correct spelling, grammar, punctuation and agreement, without changing the style.',
        when: has('OBJECTIFS_REECRITURE', 'corriger')
      },
      {
        fr: '3. Clarifie : une idée par phrase, des phrases plus courtes, des termes précis à la place des termes vagues, une structure qui guide le lecteur.',
        en: '3. Clarify: one idea per sentence, shorter sentences, precise words instead of vague ones, a structure that guides the reader.',
        when: has('OBJECTIFS_REECRITURE', 'clarifier')
      },
      {
        fr: '4. Raccourcis pour obtenir {{LONGUEUR_CIBLE}} : supprime les répétitions et les précautions inutiles avant de toucher aux idées.',
        en: '4. Shorten to get {{LONGUEUR_CIBLE}}: remove repetition and needless hedging before touching the ideas.',
        when: has('OBJECTIFS_REECRITURE', 'raccourcir')
      },
      {
        fr: '5. Adopte un ton {{TON_CIBLE}} de bout en bout.',
        en: '5. Use a {{TON_CIBLE}} tone throughout.',
        when: has('OBJECTIFS_REECRITURE', 'ton')
      },
      {
        fr: '6. Adapte le texte à ce public : {{PUBLIC_CIBLE}} (vocabulaire, niveau de détail, exemples).',
        en: '6. Adapt the text to this audience: {{PUBLIC_CIBLE}} (vocabulary, level of detail, examples).',
        when: has('OBJECTIFS_REECRITURE', 'public')
      },
      {
        fr: '7. Traduis le texte en {{LANGUE}} en conservant son style, son registre et sa mise en forme ; adapte les expressions idiomatiques au lieu de les traduire mot à mot.',
        en: '7. Translate the text into {{LANGUE}}, keeping its style, register and layout; adapt idioms instead of translating them word for word.',
        when: has('OBJECTIFS_REECRITURE', 'traduire')
      },
      {
        fr: '8. Relis en comparant avec l\'original : le sens, les faits, les chiffres et les engagements doivent être intacts.',
        en: '8. Reread against the original: the meaning, facts, figures and commitments must be intact.'
      }
    ],
    mode: [
      {
        fr: '- Modifications minimales : ne change que ce qui sert les objectifs demandés et garde les tournures de l\'auteur dès qu\'elles sont correctes.',
        en: '- Minimal changes: only change what serves the requested goals and keep the author\'s wording whenever it is correct.',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Réécris librement la forme pour atteindre les objectifs, sans rien ajouter ni retirer au fond. Une idée que tu juges utile d\'ajouter est proposée à part, étiquetée [SUGGESTION].',
        en: '- Freely rewrite the form to reach the goals, without adding or removing anything of substance. An idea you think worth adding is suggested separately, labelled [SUGGESTION].',
        when: modeIs('MIXTE')
      }
    ],
    format: [
      { fr: 'Donne d\'abord la version réécrite, prête à copier, sans commentaire à l\'intérieur.', en: 'First give the rewritten version, ready to copy, with no comments inside it.' },
      {
        fr: 'Puis un tableau des changements importants (pas les simples corrections) :\n| Avant | Après | Pourquoi |',
        en: 'Then a table of the main changes (not simple corrections):\n| Before | After | Why |',
        when: filled('EXPLIQUER')
      },
      { fr: 'N\'ajoute rien d\'autre : ni introduction, ni commentaire.', en: 'Add nothing else: no introduction, no comment.', when: v => !v.EXPLIQUER }
    ],
    constraints: [
      {
        fr: '- Aucun fait, chiffre, nom ou engagement ajouté, retiré ou modifié. Si un passage te semble faux ou ambigu, signale-le après le texte au lieu de le corriger.',
        en: '- No fact, figure, name or commitment added, removed or changed. If a passage seems wrong or ambiguous, flag it after the text instead of fixing it.'
      },
      { fr: '- Les éléments de <a_preserver> restent strictement identiques.', en: '- The items in <keep_unchanged> stay exactly the same.', when: filled('A_PRESERVER') },
      { fr: '- Conserve le ton d\'origine.', en: '- Keep the original tone.', when: hasNot('OBJECTIFS_REECRITURE', 'ton') },
      { fr: '- Garde l\'objet de l\'email s\'il y en a un, en l\'améliorant si besoin.', en: '- Keep the email subject line if there is one, improving it if needed.', when: is('TYPE_TEXTE', 'email') }
    ],
    quality: [
      { fr: '- [ ] Le sens et les faits du texte d\'origine sont intacts.', en: '- [ ] The meaning and facts of the original text are intact.' },
      { fr: '- [ ] La longueur visée est atteinte.', en: '- [ ] The target length is met.', when: has('OBJECTIFS_REECRITURE', 'raccourcir') },
      { fr: '- [ ] Chaque objectif demandé est traité.', en: '- [ ] Every requested goal is addressed.' }
    ]
  }
}
