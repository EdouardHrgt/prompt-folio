/**
 * RD-02 — Écrire un email délicat (refus, relance, mauvaise nouvelle, désaccord…).
 * La situation ajoute sa règle de rédaction ; trois versions aux stratégies différentes.
 */
import { F } from '../fields.js'
import { filled, formatIs, is, modeIs } from '../helpers.js'

const SITUATIONS = [
  {
    value: 'refuser',
    label: { fr: 'Refuser', en: 'Say no' },
    prompt: { fr: 'refuser une demande', en: 'turn down a request' },
    rule: {
      fr: 'Dis non clairement dès le début, donne une seule raison (la principale) et propose une alternative.',
      en: 'Say no clearly at the start, give one reason (the main one) and offer an alternative.'
    }
  },
  {
    value: 'relancer',
    label: { fr: 'Relancer', en: 'Chase up' },
    prompt: { fr: 'relancer une demande restée sans réponse', en: 'chase up a request that got no reply' },
    rule: {
      fr: 'Rappelle la demande en une phrase, sans reproche, facilite la réponse et fixe une échéance précise.',
      en: 'Restate the request in one sentence, without reproach, make it easy to reply and set a precise deadline.'
    }
  },
  {
    value: 'mauvaise-nouvelle',
    label: { fr: 'Annoncer une mauvaise nouvelle', en: 'Break bad news' },
    prompt: { fr: 'annoncer une mauvaise nouvelle', en: 'break bad news' },
    rule: {
      fr: 'Annonce la nouvelle dès le premier paragraphe, explique ses conséquences concrètes et ce qui est fait pour les limiter.',
      en: 'Give the news in the first paragraph, explain its concrete consequences and what is being done to limit them.'
    }
  },
  {
    value: 'desaccord',
    label: { fr: 'Exprimer un désaccord', en: 'Disagree' },
    prompt: { fr: 'exprimer un désaccord', en: 'express disagreement' },
    rule: {
      fr: 'Reconnais ce qui est juste dans la position de l\'autre, puis exprime ton désaccord avec des faits et propose une suite.',
      en: 'Acknowledge what is fair in the other person\'s position, then state your disagreement with facts and suggest a way forward.'
    }
  },
  {
    value: 'recadrer',
    label: { fr: 'Recadrer', en: 'Set expectations' },
    prompt: { fr: 'recadrer un comportement ou un travail', en: 'address a behaviour or a piece of work' },
    rule: {
      fr: 'Décris les faits observés sans juger la personne, leur impact, puis l\'attente précise et la prochaine étape.',
      en: 'Describe the observed facts without judging the person, their impact, then the precise expectation and the next step.'
    }
  },
  {
    value: 'excuser',
    label: { fr: 'S\'excuser', en: 'Apologise' },
    prompt: { fr: 'présenter des excuses', en: 'apologise' },
    rule: {
      fr: 'Reconnais le fait et son impact sans te justifier longuement, puis dis ce qui est fait pour réparer et éviter que cela se reproduise.',
      en: 'Acknowledge what happened and its impact without long justifications, then say what is being done to fix it and prevent it happening again.'
    }
  },
  {
    value: 'reclamer',
    label: { fr: 'Faire une réclamation', en: 'Make a complaint' },
    prompt: { fr: 'faire une réclamation', en: 'make a complaint' },
    rule: {
      fr: 'Expose le problème avec des faits datés, la demande précise (remboursement, correction, délai) et l\'échéance attendue.',
      en: 'Set out the problem with dated facts, the precise request (refund, fix, deadline) and the expected timeframe.'
    }
  },
  {
    value: 'faveur',
    label: { fr: 'Demander une faveur', en: 'Ask a favour' },
    prompt: { fr: 'demander une faveur', en: 'ask a favour' },
    rule: {
      fr: 'Rends la demande précise et facile à accepter, explique pourquoi cette personne, et laisse une vraie possibilité de refuser.',
      en: 'Make the request precise and easy to accept, explain why this person, and leave a real option to say no.'
    }
  }
]

const RELATIONS = [
  { value: 'collegue', label: { fr: 'Collègue', en: 'Colleague' }, prompt: { fr: 'un collègue', en: 'a colleague' } },
  { value: 'superieur', label: { fr: 'Supérieur', en: 'Manager' }, prompt: { fr: 'mon supérieur hiérarchique', en: 'my line manager' } },
  { value: 'equipe', label: { fr: 'Membre de mon équipe', en: 'Team member' }, prompt: { fr: 'un membre de mon équipe', en: 'a member of my team' } },
  { value: 'client', label: { fr: 'Client', en: 'Client' }, prompt: { fr: 'un client', en: 'a client' } },
  { value: 'fournisseur', label: { fr: 'Fournisseur', en: 'Supplier' }, prompt: { fr: 'un fournisseur', en: 'a supplier' } },
  { value: 'partenaire', label: { fr: 'Partenaire', en: 'Partner' }, prompt: { fr: 'un partenaire', en: 'a partner' } }
]

const ENJEUX = [
  { value: 'relation', label: { fr: 'La relation', en: 'The relationship' }, prompt: { fr: 'la relation', en: 'the relationship' } },
  { value: 'credibilite', label: { fr: 'Ma crédibilité', en: 'My credibility' }, prompt: { fr: 'ma crédibilité', en: 'my credibility' } },
  { value: 'calendrier', label: { fr: 'Le calendrier', en: 'The schedule' }, prompt: { fr: 'le calendrier', en: 'the schedule' } },
  { value: 'budget', label: { fr: 'Le budget', en: 'The budget' }, prompt: { fr: 'le budget', en: 'the budget' } },
  { value: 'image', label: { fr: 'L\'image de l\'entreprise', en: 'The company\'s image' }, prompt: { fr: 'l\'image de l\'entreprise', en: 'the company\'s image' } }
]

export default {
  id: 'rd-02',
  domain: 'redaction',
  version: '1.0.0',
  slug: { fr: 'email-delicat', en: 'difficult-email' },
  title: { fr: 'Écrire un email délicat', en: 'Write a difficult email' },
  summary: {
    fr: 'Refus, relance, mauvaise nouvelle, désaccord, excuses… : trois versions aux stratégies différentes, claires et respectueuses.',
    en: 'Saying no, chasing up, bad news, disagreement, apologies…: three versions with different strategies, clear and respectful.'
  },

  roles: ['coach-communication', 'manager', 'charge-communication'],
  defaultRole: 'coach-communication',
  modes: ['FACTUEL', 'MIXTE'],
  formats: ['TEXTE', 'LISTE'],
  defaults: { MODE: 'MIXTE', FORMAT: 'TEXTE', INFOS: 'ferme', PREVIEW: false, CITATIONS: false, POSTURE: 'client' },
  response: { audace: false, public: false, longueur: false, tons: ['formel', 'direct', 'chaleureux'] },

  fields: [
    F.choice('chips', 'SITUATION', { fr: 'Situation', en: 'Situation' }, SITUATIONS),
    F.choice('chips', 'RELATION_DEST', { fr: 'Vous écrivez à', en: 'You are writing to' }, RELATIONS),
    F.text('DESTINATAIRE', { fr: 'Nom ou fonction', en: 'Name or role' }, {
      promptLabel: { fr: 'Destinataire', en: 'Recipient' },
      placeholder: { fr: 'Ex. : Claire, directrice financière', en: 'E.g. Claire, finance director' }
    }),
    F.textarea('FAITS', { fr: 'Ce qui s\'est passé', en: 'What happened' }, {
      required: true,
      help: { fr: 'Les faits, brièvement : qui, quoi, quand.', en: 'The facts, briefly: who, what, when.' }
    }),
    F.textarea('ISSUE', { fr: 'Ce que vous voulez obtenir', en: 'What you want to achieve' }, {
      required: true,
      promptLabel: { fr: 'Issue souhaitée', en: 'Desired outcome' },
      placeholder: { fr: 'Ex. : décaler la livraison au 15 mars sans perdre le client', en: 'E.g. move delivery to 15 March without losing the client' }
    }),
    F.multichoice('A_PRESERVER_EMAIL', { fr: 'Ce que vous voulez préserver', en: 'What you want to protect' }, ENJEUX, {
      promptLabel: { fr: 'À préserver', en: 'To protect' },
      help: { fr: 'Plusieurs choix possibles.', en: 'You can pick several.' }
    }),
    F.textarea('ECHANGES', { fr: 'Dernier message reçu', en: 'Last message received' }, {
      promptLabel: { fr: 'Dernier message reçu', en: 'Last message received' },
      help: { fr: 'Facultatif : collez-le pour que la réponse s\'y rapporte.', en: 'Optional: paste it so the reply addresses it.' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : écrire un email qui obtient le résultat voulu en préservant ce qui compte, clair sur le fond et respectueux sur la forme.',
      en: 'Your mission: write an email that gets the desired result while protecting what matters, clear in substance and respectful in form.'
    },
    context: [
      { fr: 'Je dois écrire à {{RELATION_DEST}} pour {{SITUATION}}.', en: 'I need to write to {{RELATION_DEST}} to {{SITUATION}}.' }
    ],
    data: [
      { tag: { fr: 'situation', en: 'situation' }, items: ['DESTINATAIRE', 'FAITS', 'ISSUE', 'A_PRESERVER_EMAIL'] },
      { tag: { fr: 'echanges', en: 'previous_message' }, items: ['ECHANGES'] }
    ],
    task: [
      {
        fr: '1. Identifie ce que le destinataire ressentira probablement en lisant l\'email, et ce qui pourrait le braquer.',
        en: '1. Identify what the recipient will probably feel when reading the email, and what could put them on the defensive.'
      },
      {
        fr: '2. Rédige 3 versions avec des stratégies différentes (par exemple ferme et brève, empathique et détaillée, tournée vers la solution). Pour chacune : une ligne qui dit ce qu\'elle privilégie et ce qu\'elle risque, un objet de 8 mots au maximum, puis le corps.',
        en: '2. Write 3 versions with different strategies (for example firm and brief, empathetic and detailed, solution-focused). For each: one line on what it prioritises and what it risks, a subject line of 8 words at most, then the body.'
      },
      ...SITUATIONS.map(s => ({
        fr: `3. ${s.rule.fr}`,
        en: `3. ${s.rule.en}`,
        when: is('SITUATION', s.value)
      })),
      {
        fr: '4. Réponds aux points du dernier message reçu qui appellent une réponse.',
        en: '4. Address the points in the last message received that call for a reply.',
        when: filled('ECHANGES')
      },
      {
        fr: '5. Termine chaque version par une prochaine étape claire.',
        en: '5. End each version with a clear next step.'
      }
    ],
    mode: [
      {
        fr: '- N\'utilise que les faits décrits. Écris [À COMPLÉTER : …] là où un détail manque (date, montant, nom).',
        en: '- Only use the facts described. Write [TO COMPLETE: …] where a detail is missing (date, amount, name).',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Faits strictement issus de la situation décrite, formulations libres. Un détail que tu supposes est écrit [À COMPLÉTER : …].',
        en: '- Facts strictly from the situation described, free wording. Any detail you assume is written [TO COMPLETE: …].',
        when: modeIs('MIXTE')
      }
    ],
    format: [
      { fr: 'Les 3 versions l\'une après l\'autre, chacune prête à copier.', en: 'The 3 versions one after another, each ready to copy.', when: formatIs('TEXTE') },
      {
        fr: 'Les 3 versions prêtes à copier, puis une liste comparative : pour chaque version, ce qu\'elle privilégie, ce qu\'elle risque, quand la choisir.',
        en: 'The 3 versions ready to copy, then a comparison list: for each version, what it prioritises, what it risks, when to choose it.',
        when: formatIs('LISTE')
      }
    ],
    constraints: [
      { fr: '- Aucun reproche ni fait qui ne figure pas dans la situation décrite.', en: '- No reproach or fact that is not in the situation described.' },
      {
        fr: '- Pas de formules passives-agressives (« comme déjà indiqué », « sauf erreur de ma part »), pas de majuscules ni de points d\'exclamation pour insister.',
        en: '- No passive-aggressive phrasing ("as previously stated", "unless I am mistaken"), no capitals or exclamation marks for emphasis.'
      },
      { fr: '- 150 mots au maximum par version, objet non compris.', en: '- 150 words at most per version, subject line excluded.' },
      {
        fr: '- Supérieur : accompagne le problème d\'une solution ou d\'options.',
        en: '- Manager: pair the problem with a solution or options.',
        when: is('RELATION_DEST', 'superieur')
      }
    ],
    quality: [
      { fr: '- [ ] L\'issue souhaitée est demandée explicitement dans chaque version.', en: '- [ ] The desired outcome is explicitly asked for in every version.' },
      { fr: '- [ ] Les 3 versions suivent vraiment des stratégies différentes.', en: '- [ ] The 3 versions really follow different strategies.' },
      { fr: '- [ ] Aucune version ne dépasse 150 mots.', en: '- [ ] No version exceeds 150 words.' }
    ]
  }
}
