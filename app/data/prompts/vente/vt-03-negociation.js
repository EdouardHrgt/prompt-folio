/**
 * VT-03 — Préparer une négociation, côté acheteur ou vendeur.
 * Le choix « Vous êtes » adapte les libellés (seuil, autre partie) et une règle propre à chaque rôle.
 */
import { F } from '../fields.js'
import { filled, formatIs, is, missing, modeIs } from '../helpers.js'

const POSITIONS = [
  { value: 'vendeur', label: { fr: 'Vendeur', en: 'Seller' }, prompt: { fr: 'vendeur', en: 'the seller' } },
  { value: 'acheteur', label: { fr: 'Acheteur', en: 'Buyer' }, prompt: { fr: 'acheteur', en: 'the buyer' } }
]

const RELATIONS = [
  { value: '', label: { fr: 'Non précisée', en: 'Not specified' } },
  { value: 'nouvelle', label: { fr: 'Première affaire', en: 'First deal' }, prompt: { fr: 'première affaire ensemble', en: 'first deal together' } },
  { value: 'reguliere', label: { fr: 'Relation régulière', en: 'Ongoing relationship' }, prompt: { fr: 'relation régulière', en: 'ongoing relationship' } },
  { value: 'tendue', label: { fr: 'Relation tendue', en: 'Strained relationship' }, prompt: { fr: 'relation tendue', en: 'strained relationship' } }
]

const acheteur = is('POSITION', 'acheteur')
const vendeur = is('POSITION', 'vendeur')
/** Texte selon le rôle : { vendeur: {…}, acheteur: {…} } → fonction des valeurs. */
const byPosition = map => v => map[v.POSITION] ?? map.vendeur

export default {
  id: 'vt-03',
  domain: 'vente',
  version: '1.0.0',
  slug: { fr: 'preparer-une-negociation', en: 'prepare-a-negotiation' },
  title: { fr: 'Préparer une négociation', en: 'Prepare a negotiation' },
  summary: {
    fr: 'Côté acheteur ou vendeur : rapport de force, offre d\'ouverture, concessions donnant-donnant et déroulé de la séance.',
    en: 'Buyer or seller side: balance of power, opening offer, give-and-take concessions and how the meeting will run.'
  },

  roles: ['negociateur', 'acheteur', 'key-account-manager', 'business-developer'],
  defaultRole: 'negociateur',
  modes: ['FACTUEL', 'MIXTE'],
  formats: ['TABLEAU', 'TEXTE', 'LISTE'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TABLEAU', INFOS: 'standard', PREVIEW: false, CITATIONS: false },
  response: { audace: false, public: false, longueur: false, tons: ['direct', 'consultatif', 'formel'] },

  fields: [
    F.choice('segmented', 'POSITION', { fr: 'Vous êtes', en: 'You are' }, POSITIONS),
    F.text('OBJET', { fr: 'Objet de la négociation', en: 'What is being negotiated' }, {
      required: true,
      placeholder: { fr: 'Ex. : renouvellement du contrat de maintenance pour 3 ans', en: 'E.g. 3-year renewal of the maintenance contract' }
    }),
    F.text('AUTRE_PARTIE', byPosition({
      vendeur: { fr: 'Votre client', en: 'Your client' },
      acheteur: { fr: 'Votre fournisseur', en: 'Your supplier' }
    }), {
      promptLabel: { fr: 'Autre partie', en: 'Other party' },
      placeholder: { fr: 'Ex. : Groupe Martin, directrice des achats', en: 'E.g. Martin Group, head of procurement' }
    }),
    F.choice('chips', 'RELATION', { fr: 'Relation', en: 'Relationship' }, RELATIONS, { required: false }),
    F.text('OBJECTIF_NEGO', { fr: 'Objectif visé', en: 'Target outcome' }, {
      required: true,
      group: 'marges',
      placeholder: byPosition({
        vendeur: { fr: 'Ex. : 48 000 € sur 3 ans, paiement à 30 jours', en: 'E.g. €48,000 over 3 years, 30-day payment' },
        acheteur: { fr: 'Ex. : 40 000 € sur 3 ans, interventions sous 4 h incluses', en: 'E.g. €40,000 over 3 years, 4-hour response included' }
      })
    }),
    F.text('SEUIL', byPosition({
      vendeur: { fr: 'Prix plancher (en dessous, vous refusez)', en: 'Floor price (below it, you walk away)' },
      acheteur: { fr: 'Budget maximum (au-dessus, vous refusez)', en: 'Maximum budget (above it, you walk away)' }
    }), {
      group: 'marges',
      promptLabel: { fr: 'Seuil de rupture', en: 'Walk-away point' },
      help: { fr: 'Il reste confidentiel : il sert à l\'IA pour ne jamais vous faire franchir cette limite.', en: 'It stays confidential: the AI uses it so you never cross that line.' }
    }),
    F.textarea('REPLI', { fr: 'Solution de repli si la négociation échoue', en: 'Fallback if the negotiation fails' }, {
      group: 'marges',
      help: {
        fr: 'Ce que vous ferez sans accord : autre fournisseur, autre client, statu quo… Plus elle est solide, plus vous êtes en position de force.',
        en: 'What you will do without a deal: another supplier, another client, the status quo… The stronger it is, the stronger your position.'
      }
    }),
    F.table('POINTS', { fr: 'Points négociables', en: 'Negotiable points' }, [
      F.text('sujet', { fr: 'Sujet', en: 'Topic' }, { required: true }),
      F.text('vise', { fr: 'Ce que vous visez', en: 'What you aim for' }),
      F.text('cede', { fr: 'Ce que vous pouvez céder', en: 'What you can give' })
    ], {
      max: 10,
      help: { fr: 'Prix, délais, durée, volume, paiement, garantie, services…', en: 'Price, lead times, duration, volume, payment, warranty, services…' },
      addLabel: { fr: 'Ajouter un sujet', en: 'Add a topic' },
      presetLabel: { fr: 'Partir des sujets courants', en: 'Start from common topics' },
      preset: (v, locale) => [
        ['Prix', 'Price'], ['Délais', 'Lead times'], ['Durée d\'engagement', 'Commitment period'], ['Conditions de paiement', 'Payment terms']
      ].map(([fr, en]) => ({ sujet: locale === 'en' ? en : fr, vise: '', cede: '' }))
    }),
    F.textarea('AUTRE_INFOS', { fr: 'Ce que vous savez de l\'autre partie', en: 'What you know about the other party' }, {
      promptLabel: { fr: 'Ce que je sais de l\'autre partie', en: 'What I know about the other party' },
      help: { fr: 'Ses contraintes, ses échéances, ses alternatives, sa dernière offre…', en: 'Their constraints, deadlines, alternatives, last offer…' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : préparer une négociation qui défend mes intérêts sans abîmer la relation, où chaque concession s\'échange contre une contrepartie.',
      en: 'Your mission: prepare a negotiation that defends my interests without damaging the relationship, where every concession is traded for something in return.'
    },
    context: [
      {
        fr: 'Je suis {{POSITION}} et je prépare la négociation décrite dans <negociation>.',
        en: 'I am {{POSITION}} and I am preparing the negotiation described in <negotiation>.'
      }
    ],
    data: [
      { tag: { fr: 'negociation', en: 'negotiation' }, items: ['OBJET', 'AUTRE_PARTIE', 'RELATION'] },
      { tag: { fr: 'marges', en: 'margins' }, items: ['OBJECTIF_NEGO', 'SEUIL', 'REPLI'] },
      {
        tag: { fr: 'points_negociables', en: 'negotiable_points' },
        items: [{
          key: 'POINTS',
          render: (rows, v, locale) => rows.filter(r => r.sujet?.trim()).map(r => {
            const fr = locale === 'fr'
            const parts = [
              r.vise?.trim() && (fr ? `je vise ${r.vise.trim()}` : `I aim for ${r.vise.trim()}`),
              r.cede?.trim() && (fr ? `je peux céder ${r.cede.trim()}` : `I can give ${r.cede.trim()}`)
            ].filter(Boolean)
            return `- ${r.sujet.trim()}${parts.length ? (fr ? ' : ' : ': ') + parts.join(' ; ') : ''}`
          }).join('\n')
        }]
      },
      { tag: { fr: 'autre_partie', en: 'other_party' }, items: ['AUTRE_INFOS'] }
    ],
    task: [
      {
        fr: '1. Évalue le rapport de force : mes atouts, ceux de l\'autre partie, la solidité de chaque solution de repli et ce que chacun perd sans accord.',
        en: '1. Assess the balance of power: my strengths, the other party\'s, how solid each side\'s fallback is and what each loses without a deal.'
      },
      {
        fr: '2. Estime la zone d\'accord possible entre mon seuil et ce que l\'autre partie peut probablement accepter. Si les informations ne permettent pas de l\'estimer, dis-le et indique ce qu\'il faut découvrir en séance.',
        en: '2. Estimate the possible zone of agreement between my walk-away point and what the other party can probably accept. If the information does not allow it, say so and state what must be found out during the meeting.'
      },
      {
        fr: '3. Propose une offre d\'ouverture ambitieuse mais défendable, avec sa justification en une phrase.',
        en: '3. Suggest an ambitious but defensible opening offer, with a one-sentence justification.'
      },
      {
        fr: '4. Construis le plan de concessions : pour chaque sujet négociable, l\'ordre dans lequel céder, de combien, et la contrepartie à demander en échange.',
        en: '4. Build the concession plan: for each negotiable topic, the order in which to give ground, by how much, and what to ask for in return.'
      },
      {
        fr: '5. Anticipe 4 tactiques probables de l\'autre partie (pression sur le délai, « c\'est à prendre ou à laisser », appel à un supérieur, demandes de dernière minute…) avec une réplique pour chacune.',
        en: '5. Anticipate 4 likely tactics from the other party (deadline pressure, "take it or leave it", deferring to a superior, last-minute asks…) with a response to each.'
      },
      {
        fr: '6. Rédige le déroulé de la séance (ouverture, exploration, propositions, conclusion) avec 1 ou 2 phrases clés pour chaque étape.',
        en: '6. Write how the meeting will run (opening, exploration, proposals, close) with 1 or 2 key sentences for each stage.'
      },
      {
        fr: '7. Fixe les conditions de sortie : quand conclure, quand suspendre, quand refuser au regard de mon seuil et de ma solution de repli.',
        en: '7. Set the exit conditions: when to close, when to pause, when to walk away given my walk-away point and my fallback.'
      }
    ],
    mode: [
      {
        fr: '- Appuie-toi uniquement sur les informations fournies. Écris [INFO MANQUANTE : …] là où une donnée clé manque (marge, alternative, échéance).',
        en: '- Rely only on the information provided. Write [MISSING INFO: …] where a key piece of data is missing (margin, alternative, deadline).',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Chiffres et faits strictement issus des données. Les suppositions sur l\'autre partie sont étiquetées [HYPOTHÈSE], chacune avec une question pour la vérifier en séance.',
        en: '- Figures and facts strictly from the data. Assumptions about the other party are labelled [ASSUMPTION], each with a question to check it during the meeting.',
        when: modeIs('MIXTE')
      }
    ],
    format: [
      { fr: 'Commence par une synthèse en 3 lignes : objectif, seuil, offre d\'ouverture.', en: 'Start with a 3-line summary: target, walk-away point, opening offer.' },
      {
        fr: 'Plan de concessions en tableau :\n| Sujet | Ouverture | Concessions possibles, dans l\'ordre | Contrepartie demandée | Limite |\nTactiques en tableau :\n| Tactique | Comment la repérer | Réplique |\nLe reste en listes courtes.',
        en: 'Concession plan as a table:\n| Topic | Opening | Possible concessions, in order | What to ask in return | Limit |\nTactics as a table:\n| Tactic | How to spot it | Response |\nEverything else as short lists.',
        when: formatIs('TABLEAU')
      },
      { fr: 'Une note de préparation rédigée, une section par étape, à relire juste avant la séance.', en: 'A written preparation memo, one section per step, to reread just before the meeting.', when: formatIs('TEXTE') },
      { fr: 'Une fiche de séance : listes courtes, lisibles d\'un coup d\'œil pendant la négociation.', en: 'A meeting cheat sheet: short lists, readable at a glance during the negotiation.', when: formatIs('LISTE') }
    ],
    constraints: [
      { fr: '- Aucune concession sans contrepartie.', en: '- No concession without something in return.' },
      { fr: '- Reste loyal : pas de bluff sur des faits vérifiables, pas de pression abusive.', en: '- Stay fair: no bluffing about verifiable facts, no undue pressure.' },
      {
        fr: '- Acheteur : ne révèle jamais ton budget maximum et fais justifier chaque prix par le fournisseur.',
        en: '- Buyer: never reveal your maximum budget and have the supplier justify every price.',
        when: acheteur
      },
      {
        fr: '- Vendeur : défends la valeur avant de parler prix ; toute remise s\'échange contre un engagement (volume, durée, délai de paiement, témoignage client).',
        en: '- Seller: defend the value before discussing price; any discount is traded for a commitment (volume, duration, payment terms, client testimonial).',
        when: vendeur
      },
      {
        fr: '- Mon seuil n\'est pas indiqué : propose une méthode pour le fixer avant la séance.',
        en: '- My walk-away point is not given: suggest a method to set it before the meeting.',
        when: missing('SEUIL')
      }
    ],
    quality: [
      { fr: '- [ ] Chaque concession est associée à une contrepartie.', en: '- [ ] Every concession is paired with something in return.' },
      { fr: '- [ ] Aucune proposition ne franchit mon seuil.', en: '- [ ] No proposal crosses my walk-away point.', when: filled('SEUIL') },
      { fr: '- [ ] Les suppositions sur l\'autre partie sont signalées comme telles.', en: '- [ ] Assumptions about the other party are flagged as such.' }
    ]
  }
}
