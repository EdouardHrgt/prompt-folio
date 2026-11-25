/**
 * VT-04 — Rédiger une annonce ou une fiche produit.
 * Le type d'annonce adapte les champs (surface et DPE pour l'immobilier, état pour l'occasion…)
 * et ajoute ses étapes propres (mentions obligatoires, points clés de page produit).
 */
import { F } from '../fields.js'
import { PROFILES } from './fields.js'
import { filled, formatIs, is, isNot, jsonFormat, modeIs, strictFormatCheck } from '../helpers.js'

const TYPES = [
  { value: 'immobilier', label: { fr: 'Annonce immobilière', en: 'Property listing' }, prompt: { fr: 'une annonce immobilière', en: 'a property listing' } },
  { value: 'produit', label: { fr: 'Fiche produit e-commerce', en: 'E-commerce product page' }, prompt: { fr: 'une fiche produit pour un site e-commerce', en: 'a product page for an online shop' } },
  { value: 'service', label: { fr: 'Présentation de service', en: 'Service description' }, prompt: { fr: 'la présentation d\'un service', en: 'a service description' } },
  { value: 'occasion', label: { fr: 'Annonce d\'occasion', en: 'Second-hand listing' }, prompt: { fr: 'une annonce de vente d\'occasion', en: 'a second-hand sale listing' } }
]

const SUPPORTS = [
  { value: 'annonces', label: { fr: 'Site d\'annonces', en: 'Listings site' }, prompt: { fr: 'un site d\'annonces (texte de 150 à 250 mots)', en: 'a listings site (150 to 250 words)' } },
  { value: 'ecommerce', label: { fr: 'Site e-commerce', en: 'Online shop' }, prompt: { fr: 'une page de site e-commerce (description de 120 à 200 mots)', en: 'an online shop page (120 to 200-word description)' } },
  { value: 'reseaux', label: { fr: 'Réseaux sociaux', en: 'Social media' }, prompt: { fr: 'les réseaux sociaux (80 mots au maximum)', en: 'social media (80 words at most)' } },
  { value: 'vitrine', label: { fr: 'Vitrine / affiche', en: 'Shop window / poster' }, prompt: { fr: 'une vitrine ou une affiche (40 mots au maximum, lisible de loin)', en: 'a shop window or poster (40 words at most, readable from a distance)' } }
]

const DPE = [
  { value: '', label: { fr: 'Non connue', en: 'Unknown' } },
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => ({ value: c, label: { fr: c, en: c } }))
]

const ETATS = [
  { value: '', label: { fr: 'Non précisé', en: 'Not specified' } },
  { value: 'neuf', label: { fr: 'Neuf', en: 'New' }, prompt: { fr: 'neuf', en: 'new' } },
  { value: 'tres-bon', label: { fr: 'Très bon état', en: 'Very good' }, prompt: { fr: 'très bon état', en: 'very good condition' } },
  { value: 'bon', label: { fr: 'Bon état', en: 'Good' }, prompt: { fr: 'bon état', en: 'good condition' } },
  { value: 'usage', label: { fr: 'Traces d\'usage', en: 'Signs of wear' }, prompt: { fr: 'traces d\'usage', en: 'signs of wear' } }
]

const immo = is('TYPE_ANNONCE', 'immobilier')
/** Texte selon le type d'annonce : { immobilier: {…}, default: {…} } → fonction des valeurs. */
const byType = map => v => map[v.TYPE_ANNONCE] ?? map.default

export default {
  id: 'vt-04',
  domain: 'vente',
  version: '1.0.0',
  slug: { fr: 'rediger-une-annonce', en: 'write-a-listing' },
  title: { fr: 'Rédiger une annonce ou une fiche produit', en: 'Write a listing or product page' },
  summary: {
    fr: 'Bien immobilier, produit, service ou occasion : titres, annonce prête à publier, version courte et mots-clés.',
    en: 'Property, product, service or second-hand item: titles, a ready-to-publish listing, a short version and keywords.'
  },

  roles: ['redacteur-annonces', 'conseiller-vente', 'business-developer'],
  defaultRole: 'redacteur-annonces',
  modes: ['FACTUEL', 'MIXTE', 'CREATIF'],
  formats: ['TEXTE', 'LISTE', 'JSON'],
  defaults: { MODE: 'CREATIF', FORMAT: 'TEXTE', INFOS: 'ferme', PREVIEW: false, CITATIONS: false, AUDACE: 3 },
  response: { audace: true, public: false, longueur: false, tons: ['chaleureux', 'premium', 'enthousiaste', 'neutre'] },

  fields: [
    F.choice('chips', 'TYPE_ANNONCE', { fr: 'Type d\'annonce', en: 'Type of listing' }, TYPES),
    F.text('NOM_ARTICLE', byType({
      immobilier: { fr: 'Type de bien', en: 'Type of property' },
      produit: { fr: 'Nom du produit', en: 'Product name' },
      service: { fr: 'Nom du service', en: 'Service name' },
      default: { fr: 'Ce que vous vendez', en: 'What you are selling' }
    }), {
      required: true,
      group: 'objet',
      placeholder: byType({
        immobilier: { fr: 'Ex. : maison de ville avec jardin', en: 'E.g. townhouse with garden' },
        produit: { fr: 'Ex. : sac à dos de randonnée 30 L', en: 'E.g. 30 L hiking backpack' },
        service: { fr: 'Ex. : ménage à domicile', en: 'E.g. home cleaning' },
        default: { fr: 'Ex. : vélo de route taille M', en: 'E.g. size M road bike' }
      })
    }),
    F.text('SURFACE', { fr: 'Surface', en: 'Floor area' }, { group: 'objet', showIf: immo, placeholder: { fr: 'Ex. : 95 m², terrain de 300 m²', en: 'E.g. 95 m², 300 m² plot' } }),
    F.text('PIECES', { fr: 'Pièces', en: 'Rooms' }, { group: 'objet', showIf: immo, placeholder: { fr: 'Ex. : 5 pièces dont 3 chambres', en: 'E.g. 5 rooms including 3 bedrooms' } }),
    F.text('LOCALISATION', { fr: 'Ville ou quartier', en: 'Town or area' }, {
      group: 'objet',
      showIf: immo,
      help: { fr: 'Pas d\'adresse exacte dans une annonce publique.', en: 'No exact address in a public listing.' }
    }),
    F.choice('chips', 'DPE', { fr: 'Classe énergie (DPE)', en: 'Energy rating (EPC)' }, DPE, { required: false, group: 'objet', showIf: immo }),
    F.choice('chips', 'ETAT', { fr: 'État', en: 'Condition' }, ETATS, { required: false, group: 'objet', showIf: is('TYPE_ANNONCE', 'occasion') }),
    F.textarea('DESCRIPTION', byType({
      immobilier: { fr: 'Description du bien', en: 'Property description' },
      produit: { fr: 'Caractéristiques techniques', en: 'Technical specifications' },
      service: { fr: 'Ce qui est inclus', en: 'What is included' },
      default: { fr: 'Caractéristiques', en: 'Details' }
    }), {
      required: true,
      group: 'objet',
      placeholder: byType({
        immobilier: { fr: 'Ex. : séjour traversant de 35 m², cuisine refaite en 2023, garage', en: 'E.g. 35 m² dual-aspect living room, kitchen redone in 2023, garage' },
        produit: { fr: 'Ex. : 1,1 kg, toile recyclée, dos ventilé, housse de pluie', en: 'E.g. 1.1 kg, recycled fabric, ventilated back, rain cover' },
        service: { fr: 'Ex. : 2 h par semaine, produits fournis, intervenants assurés', en: 'E.g. 2 hours a week, products supplied, insured staff' },
        default: { fr: 'Ex. : acheté en 2022, révisé en mars, pneus neufs', en: 'E.g. bought in 2022, serviced in March, new tyres' }
      })
    }),
    F.text('PRIX', byType({ service: { fr: 'Tarif', en: 'Rate' }, default: { fr: 'Prix', en: 'Price' } }), {
      group: 'objet',
      placeholder: byType({
        immobilier: { fr: 'Ex. : 329 000 € honoraires inclus', en: 'E.g. €329,000 including agency fees' },
        service: { fr: 'Ex. : 25 € de l\'heure', en: 'E.g. €25 per hour' },
        default: { fr: 'Ex. : 89 €', en: 'E.g. €89' }
      })
    }),
    F.tags('POINTS_FORTS', { fr: 'Points forts', en: 'Strengths' }, { placeholder: { fr: 'Ex. : proche des écoles', en: 'E.g. close to schools' } }),
    F.textarea('POINTS_FAIBLES', { fr: 'Points faibles à présenter honnêtement', en: 'Weaknesses to present honestly' }, {
      help: {
        fr: 'Une annonce qui cache un défaut fait perdre des visites et la confiance. L\'IA les présentera avec tact.',
        en: 'A listing that hides a flaw wastes viewings and trust. The AI will present them tactfully.'
      },
      placeholder: byType({
        immobilier: { fr: 'Ex. : pas d\'ascenseur, salle de bains à rafraîchir', en: 'E.g. no lift, bathroom needs updating' },
        produit: { fr: 'Ex. : pas de poche pour gourde, coloris limités', en: 'E.g. no bottle pocket, limited colours' },
        service: { fr: 'Ex. : pas d\'intervention le week-end', en: 'E.g. no weekend service' },
        default: { fr: 'Ex. : rayure sur le cadre, selle d\'origine usée', en: 'E.g. scratch on the frame, worn original saddle' }
      })
    }),
    F.combobox('CIBLE_ANNONCE', { fr: 'Acheteur visé', en: 'Target buyer' }, {
      help: { fr: 'Choisissez dans la liste ou décrivez-le.', en: 'Pick from the list or describe them.' },
      options: PROFILES.map(p => ({ value: p.fr, label: p }))
    }),
    F.choice('chips', 'SUPPORT', { fr: 'Où sera-t-elle publiée ?', en: 'Where will it be published?' }, SUPPORTS)
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : écrire une annonce qui donne envie et qui reste exacte, pour attirer les bons acheteurs et éviter les visites ou les retours inutiles.',
      en: 'Your mission: write a listing that makes people want it while staying accurate, to attract the right buyers and avoid pointless viewings or returns.'
    },
    context: [
      { fr: 'Je dois rédiger {{TYPE_ANNONCE}}, publiée sur {{SUPPORT}}.', en: 'I need to write {{TYPE_ANNONCE}}, published on {{SUPPORT}}.' }
    ],
    data: [
      { tag: { fr: 'objet', en: 'item' }, items: ['NOM_ARTICLE', 'SURFACE', 'PIECES', 'LOCALISATION', 'DPE', 'ETAT', 'DESCRIPTION', 'PRIX'] },
      { tag: { fr: 'arguments', en: 'selling_points' }, items: ['POINTS_FORTS', 'POINTS_FAIBLES', 'CIBLE_ANNONCE'] }
    ],
    task: [
      {
        fr: '1. Identifie les 3 arguments qui compteront le plus pour l\'acheteur visé (s\'il n\'est pas précisé, pour l\'acheteur le plus probable, que tu nommes).',
        en: '1. Identify the 3 selling points that will matter most to the target buyer (if none is given, to the most likely buyer, whom you name).'
      },
      {
        fr: '2. Propose 3 titres différents de 60 caractères au maximum, du plus factuel au plus accrocheur.',
        en: '2. Suggest 3 different titles of 60 characters at most, from the most factual to the most catchy.'
      },
      {
        fr: '3. Rédige l\'annonce : ouvre sur le bénéfice principal, puis les caractéristiques, puis les informations pratiques.',
        en: '3. Write the listing: open with the main benefit, then the features, then the practical details.'
      },
      {
        fr: '4. Présente les points faibles avec tact, sans les cacher ni les déformer.',
        en: '4. Present the weaknesses tactfully, without hiding or distorting them.',
        when: filled('POINTS_FAIBLES')
      },
      {
        fr: '5. Rédige 5 points clés courts, un bénéfice par ligne, pour le haut de la page produit.',
        en: '5. Write 5 short key points, one benefit per line, for the top of the product page.',
        when: is('TYPE_ANNONCE', 'produit')
      },
      {
        fr: '6. Rédige une version courte pour les réseaux sociaux (60 mots au maximum) avec un appel à l\'action.',
        en: '6. Write a short social media version (60 words at most) with a call to action.',
        when: isNot('SUPPORT', 'reseaux', 'vitrine')
      },
      {
        fr: '7. Propose 8 à 12 mots-clés que les acheteurs taperaient pour trouver cette annonce.',
        en: '7. Suggest 8 to 12 keywords buyers would type to find this listing.',
        when: isNot('SUPPORT', 'vitrine')
      },
      {
        fr: '8. Liste les mentions obligatoires d\'une annonce immobilière selon la réglementation française (classes énergie et climat, estimation des dépenses annuelles d\'énergie, honoraires et partie qui les paie, informations de copropriété le cas échéant) et indique pour chacune si elle est fournie ou [À COMPLÉTER].',
        en: '8. List the mandatory disclosures for a property listing under French regulations (energy and climate ratings, estimated annual energy costs, agency fees and who pays them, co-ownership information where relevant) and state for each whether it is provided or [TO COMPLETE].',
        when: immo
      }
    ],
    mode: [
      {
        fr: '- N\'utilise que les informations fournies, sans adjectif qui ajoute une qualité non mentionnée.',
        en: '- Only use the information provided, with no adjective that adds an unmentioned quality.',
        when: modeIs('FACTUEL')
      },
      {
        fr: '- Faits strictement issus des données ; style vivant autorisé (audace {{AUDACE}}/5). Une qualité non mentionnée (luminosité, calme, vue, état…) n\'est jamais affirmée : propose-la en [À VÉRIFIER].',
        en: '- Facts strictly from the data; lively style allowed (boldness {{AUDACE}}/5). An unmentioned quality (light, quiet, view, condition…) is never stated: suggest it as [TO CHECK].',
        when: modeIs('MIXTE')
      },
      {
        fr: '- Écriture évocatrice et différenciante, avec une audace de {{AUDACE}}/5 (1 = sobre, 5 = très marquant) : fais vivre le lieu ou l\'usage. Aucune caractéristique ne peut être inventée ; une qualité non mentionnée est proposée en [À VÉRIFIER].',
        en: '- Evocative, distinctive writing with boldness {{AUDACE}}/5 (1 = understated, 5 = very striking): bring the place or the use to life. No feature may be invented; an unmentioned quality is suggested as [TO CHECK].',
        when: modeIs('CREATIF')
      }
    ],
    format: [
      {
        fr: 'Une section par étape de la tâche, avec un intitulé court. L\'annonce elle-même est prête à copier, sans commentaire à l\'intérieur.',
        en: 'One section per task step, with a short heading. The listing itself is ready to copy, with no comments inside it.',
        when: formatIs('TEXTE')
      },
      {
        fr: 'Chaque élément en liste ; l\'annonce en paragraphes courts, prête à copier.',
        en: 'Each item as a list; the listing in short paragraphs, ready to copy.',
        when: formatIs('LISTE')
      },
      jsonFormat({
        fr: '{"arguments": [], "titres": [], "annonce": "", "points_cles": [], "version_courte": "", "mots_cles": [], "mentions_obligatoires": [{"mention": "", "valeur": "", "statut": "fournie | à compléter"}], "a_verifier": []}',
        en: '{"selling_points": [], "titles": [], "listing": "", "key_points": [], "short_version": "", "keywords": [], "mandatory_disclosures": [{"disclosure": "", "value": "", "status": "provided | to complete"}], "to_check": []}'
      })
    ],
    constraints: [
      { fr: '- Pas de superlatifs vides (« exceptionnel », « unique », « rare ») sans élément qui les justifie.', en: '- No empty superlatives ("exceptional", "unique", "rare") without something to back them up.' },
      { fr: '- Aucune adresse exacte ni donnée personnelle dans le texte.', en: '- No exact address or personal data in the text.' },
      {
        fr: '- Aucune mention discriminatoire, et le prix est présenté avec la charge des honoraires.',
        en: '- No discriminatory wording, and the price is shown with who pays the agency fees.',
        when: immo
      }
    ],
    quality: [
      { fr: '- [ ] Chaque caractéristique citée figure dans les données.', en: '- [ ] Every feature mentioned appears in the data.' },
      { fr: '- [ ] Les titres font 60 caractères au maximum.', en: '- [ ] Titles are 60 characters at most.' },
      { fr: '- [ ] Aucun point faible n\'est caché ni déformé.', en: '- [ ] No weakness is hidden or distorted.', when: filled('POINTS_FAIBLES') },
      strictFormatCheck(['JSON'])
    ]
  }
}
