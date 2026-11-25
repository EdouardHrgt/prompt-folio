/**
 * VT-02 — Comparateur d'offres, de produits ou de prix (côté acheteur).
 * Offres en fiches (textes longs), grille de critères en tableau dont les poids totalisent 100.
 */
import { F } from '../fields.js'
import { csvFormat, filled, formatIs, is, jsonFormat, missing, strictFormatCheck } from '../helpers.js'

const HORIZONS = [
  ...['1', '2', '3', '5', '10'].map(n => ({
    value: n,
    label: { fr: `${n} an${n === '1' ? '' : 's'}`, en: `${n} year${n === '1' ? '' : 's'}` },
    prompt: { fr: `${n} an${n === '1' ? '' : 's'}`, en: `${n} year${n === '1' ? '' : 's'}` }
  })),
  // Durée libre (crédit sur 20 ans, location sur 18 mois…) : saisie dans HORIZON_AUTRE.
  { value: 'autre', label: { fr: 'Autre', en: 'Other' }, prompt: { fr: '{{HORIZON_AUTRE}}', en: '{{HORIZON_AUTRE}}' } }
]

// ─── Type d'achat : adapte les champs des offres, la grille type et une règle du prompt ───
const CATEGORIES = [
  { value: '', label: { fr: 'Général', en: 'General' } },
  { value: 'logiciel', label: { fr: 'Logiciel / abonnement', en: 'Software / subscription' }, prompt: { fr: 'logiciel ou abonnement', en: 'software or subscription' } },
  { value: 'materiel', label: { fr: 'Produit / matériel', en: 'Product / equipment' }, prompt: { fr: 'produit ou matériel', en: 'product or equipment' } },
  { value: 'prestation', label: { fr: 'Prestation de service', en: 'Service' }, prompt: { fr: 'prestation de service', en: 'service engagement' } },
  { value: 'credit', label: { fr: 'Crédit / financement', en: 'Loan / financing' }, prompt: { fr: 'crédit ou financement', en: 'loan or financing' } },
  { value: 'assurance', label: { fr: 'Assurance', en: 'Insurance' }, prompt: { fr: 'assurance', en: 'insurance' } },
  { value: 'energie', label: { fr: 'Énergie / télécoms', en: 'Energy / telecoms' }, prompt: { fr: 'contrat d\'énergie ou de télécoms', en: 'energy or telecoms contract' } }
]

/** Texte selon le type d'achat : byCategory({ credit: {…}, default: {…} }) → fonction des valeurs. */
const byCategory = map => v => map[v.CATEGORIE] ?? map.default

const OFFER_TEXTS = {
  prix: {
    label: byCategory({
      credit: { fr: 'Taux et mensualité', en: 'Rate and monthly payment' },
      assurance: { fr: 'Prime', en: 'Premium' },
      energie: { fr: 'Abonnement et prix unitaire', en: 'Standing charge and unit price' },
      default: { fr: 'Prix', en: 'Price' }
    }),
    placeholder: byCategory({
      materiel: { fr: 'Ex. : 1 290 € HT l\'unité', en: 'E.g. €1,290 per unit excl. VAT' },
      prestation: { fr: 'Ex. : 650 € HT / jour, 12 jours', en: 'E.g. €650 per day excl. VAT, 12 days' },
      credit: { fr: 'Ex. : taux 3,45 %, mensualité 1 432 €, TAEG 3,98 %', en: 'E.g. 3.45% rate, €1,432 monthly, 3.98% APR' },
      assurance: { fr: 'Ex. : 38 € / mois', en: 'E.g. €38 / month' },
      energie: { fr: 'Ex. : 14 € / mois + 0,21 € / kWh', en: 'E.g. €14 / month + €0.21 / kWh' },
      default: { fr: 'Ex. : 12 € / utilisateur / mois', en: 'E.g. €12 / user / month' }
    })
  },
  conditions: {
    label: byCategory({
      credit: { fr: 'Frais et assurance emprunteur', en: 'Fees and loan insurance' },
      assurance: { fr: 'Franchises et exclusions', en: 'Deductibles and exclusions' },
      default: { fr: 'Engagement et frais', en: 'Commitment and fees' }
    }),
    placeholder: byCategory({
      materiel: { fr: 'Ex. : livraison 90 €, garantie 2 ans', en: 'E.g. €90 delivery, 2-year warranty' },
      prestation: { fr: 'Ex. : déplacements inclus, paiement à 30 jours', en: 'E.g. travel included, 30-day payment terms' },
      credit: { fr: 'Ex. : frais de dossier 1 000 €, garantie 2 800 €, assurance 0,30 % du capital', en: 'E.g. €1,000 arrangement fee, €2,800 guarantee, insurance 0.30% of capital' },
      assurance: { fr: 'Ex. : franchise 150 €, dégâts des eaux exclus', en: 'E.g. €150 deductible, water damage excluded' },
      energie: { fr: 'Ex. : sans engagement, prix fixe 2 ans', en: 'E.g. no commitment, price fixed for 2 years' },
      default: { fr: 'Ex. : engagement 12 mois, 500 € de mise en place', en: 'E.g. 12-month commitment, €500 setup fee' }
    })
  },
  caracteristiques: {
    label: byCategory({
      credit: { fr: 'Conditions du prêt', en: 'Loan terms' },
      assurance: { fr: 'Garanties', en: 'Cover' },
      prestation: { fr: 'Périmètre et livrables', en: 'Scope and deliverables' },
      default: { fr: 'Caractéristiques et limites', en: 'Features and limits' }
    }),
    placeholder: byCategory({
      credit: { fr: 'Ex. : modulation des échéances, remboursement anticipé sans pénalité', en: 'E.g. flexible repayments, no early repayment penalty' },
      assurance: { fr: 'Ex. : responsabilité civile, vol, bris de glace, assistance 24 h/24', en: 'E.g. liability, theft, glass breakage, 24/7 assistance' },
      default: { fr: '', en: '' }
    })
  }
}

// Grilles type proposées par le bouton « Partir d'une grille type » (poids sur 100).
const PRESETS = {
  logiciel: [['Prix', 'Price', 30], ['Fonctionnalités', 'Features', 25], ['Sécurité et conformité', 'Security and compliance', 20], ['Support', 'Support', 15], ['Intégrations', 'Integrations', 10]],
  materiel: [['Prix', 'Price', 35], ['Qualité et durabilité', 'Quality and durability', 25], ['Garantie et SAV', 'Warranty and after-sales', 20], ['Délais de livraison', 'Delivery time', 20]],
  prestation: [['Prix', 'Price', 30], ['Expertise et références', 'Expertise and references', 30], ['Méthode', 'Approach', 25], ['Disponibilité', 'Availability', 15]],
  credit: [['Coût total du crédit', 'Total cost of credit', 50], ['Assurance emprunteur', 'Loan insurance', 20], ['Souplesse (modulation, remboursement anticipé)', 'Flexibility (repayment changes, early repayment)', 20], ['Qualité du conseil et délais', 'Advice quality and turnaround', 10]],
  assurance: [['Garanties', 'Cover', 35], ['Prime', 'Premium', 30], ['Franchises et exclusions', 'Deductibles and exclusions', 20], ['Gestion des sinistres', 'Claims handling', 15]],
  energie: [['Coût annuel', 'Annual cost', 50], ['Engagement et souplesse', 'Commitment and flexibility', 20], ['Qualité de service', 'Service quality', 20], ['Engagements environnementaux', 'Environmental commitments', 10]],
  default: [['Prix', 'Price', 40], ['Qualité', 'Quality', 30], ['Service', 'Service', 20], ['Conditions', 'Terms', 10]]
}
const presetRows = (v, locale) => (PRESETS[v.CATEGORIE] ?? PRESETS.default).map(([fr, en, poids]) => ({ critere: locale === 'en' ? en : fr, poids }))

const blank = v => !String(v ?? '').trim()
const localize = (text, locale) => text?.[locale] ?? text?.fr ?? ''
const line = (label, value) => (value?.trim() ? `\n  ${label}${value.trim().replace(/\n/g, '\n  ')}` : '')

export default {
  id: 'vt-02',
  domain: 'vente',
  version: '1.0.0',
  slug: { fr: 'comparer-des-offres', en: 'compare-offers' },
  title: { fr: 'Comparer des offres', en: 'Compare offers' },
  summary: {
    fr: 'Devis, abonnements, crédits, assurances… : coût total sur la même base, notes pondérées et recommandation.',
    en: 'Quotes, subscriptions, loans, insurance…: total cost on a common basis, weighted scores and a recommendation.'
  },

  roles: ['acheteur', 'analyste-achats'],
  defaultRole: 'acheteur',
  modes: ['FACTUEL'],
  formats: ['TABLEAU', 'TEXTE', 'JSON', 'CSV'],
  defaults: { MODE: 'FACTUEL', FORMAT: 'TABLEAU', INFOS: 'standard', PREVIEW: true, CITATIONS: true },
  response: {
    audace: false,
    public: true,
    longueur: true,
    tons: ['neutre', 'formel', 'direct'],
    lengthScope: {
      fr: 'Cette longueur s\'applique à la synthèse et à la recommandation ; les tableaux et les calculs n\'y sont pas comptés.',
      en: 'This length applies to the summary and the recommendation; tables and calculations are not counted.'
    }
  },

  fields: [
    F.choice('chips', 'CATEGORIE', { fr: 'Type d\'achat', en: 'Type of purchase' }, CATEGORIES, {
      required: false,
      group: 'besoin',
      help: { fr: 'Adapte les champs des offres, la grille type et les règles de comparaison.', en: 'Adapts the offer fields, the template grid and the comparison rules.' }
    }),
    F.textarea('BESOIN', { fr: 'Ce que vous cherchez', en: 'What you are looking for' }, {
      required: true,
      group: 'besoin',
      promptLabel: { fr: 'Besoin', en: 'Need' },
      placeholder: byCategory({
        materiel: { fr: 'Ex. : 25 ordinateurs portables pour l\'équipe commerciale', en: 'E.g. 25 laptops for the sales team' },
        prestation: { fr: 'Ex. : refonte de notre site vitrine', en: 'E.g. redesign of our company website' },
        credit: { fr: 'Ex. : prêt immobilier pour l\'achat de notre résidence principale', en: 'E.g. mortgage to buy our main home' },
        assurance: { fr: 'Ex. : assurance habitation pour un appartement de 70 m²', en: 'E.g. home insurance for a 70 m² flat' },
        energie: { fr: 'Ex. : contrat d\'électricité pour nos bureaux', en: 'E.g. electricity contract for our offices' },
        default: { fr: 'Ex. : un outil de visioconférence pour remplacer nos 3 abonnements actuels', en: 'E.g. a video conferencing tool to replace our 3 current subscriptions' }
      })
    }),
    F.text('VOLUME', { fr: 'Volume ou montant', en: 'Volume or amount' }, {
      group: 'besoin',
      placeholder: byCategory({
        logiciel: { fr: 'Ex. : 40 utilisateurs sur 2 sites', en: 'E.g. 40 users across 2 sites' },
        materiel: { fr: 'Ex. : 25 unités', en: 'E.g. 25 units' },
        credit: { fr: 'Ex. : 250 000 € empruntés', en: 'E.g. €250,000 borrowed' },
        assurance: { fr: 'Ex. : 70 m², 3 pièces, valeur du mobilier 30 000 €', en: 'E.g. 70 m², 3 rooms, contents worth €30,000' },
        energie: { fr: 'Ex. : 45 000 kWh par an', en: 'E.g. 45,000 kWh per year' },
        default: { fr: 'Ex. : 40 utilisateurs ; 250 000 € empruntés', en: 'E.g. 40 users; €250,000 borrowed' }
      })
    }),
    F.choice('chips', 'HORIZON', { fr: 'Coût total calculé sur', en: 'Total cost calculated over' }, HORIZONS, { default: '3', group: 'besoin' }),
    F.text('HORIZON_AUTRE', { fr: 'Durée', en: 'Duration' }, {
      required: true,
      group: 'besoin',
      showIf: is('HORIZON', 'autre'),
      placeholder: { fr: 'Ex. : 20 ans, 18 mois', en: 'E.g. 20 years, 18 months' }
    }),
    F.tags('ELIMINATOIRES', { fr: 'Exigences non négociables', en: 'Must-have requirements' }, {
      group: 'besoin',
      promptLabel: { fr: 'Critères éliminatoires', en: 'Knock-out criteria' },
      help: { fr: 'Une offre qui ne les remplit pas est écartée.', en: 'An offer that does not meet them is ruled out.' },
      placeholder: { fr: 'Ex. : hébergement en Europe', en: 'E.g. hosted in Europe' }
    }),
    F.repeater('OFFRES', { fr: 'Offres à comparer', en: 'Offers to compare' }, [
      F.text('nom', { fr: 'Nom de l\'offre', en: 'Offer name' }, { required: true, placeholder: { fr: 'Ex. : Fournisseur A — formule Pro', en: 'E.g. Supplier A — Pro plan' } }),
      F.text('prix', OFFER_TEXTS.prix.label, { placeholder: OFFER_TEXTS.prix.placeholder }),
      F.text('conditions', OFFER_TEXTS.conditions.label, { placeholder: OFFER_TEXTS.conditions.placeholder }),
      F.textarea('caracteristiques', OFFER_TEXTS.caracteristiques.label, {
        placeholder: OFFER_TEXTS.caracteristiques.placeholder,
        help: { fr: 'Collez le descriptif du devis, de l\'offre ou de la page produit.', en: 'Paste the description from the quote, offer or product page.' }
      })
    ], {
      required: true,
      min: 2,
      max: 10,
      initialItems: 2,
      itemLabel: { fr: 'Offre', en: 'Offer' },
      help: { fr: 'Une fiche par offre. Une information non renseignée sera signalée « Non communiqué », jamais estimée.', en: 'One card per offer. Missing information is reported as "Not provided", never estimated.' },
      addLabel: { fr: 'Ajouter une offre', en: 'Add an offer' }
    }),
    F.table('CRITERES', { fr: 'Grille de critères', en: 'Criteria grid' }, [
      F.text('critere', { fr: 'Critère', en: 'Criterion' }, { required: true }),
      F.number('poids', { fr: 'Poids', en: 'Weight' }, { required: true, min: 0 })
    ], {
      max: 10,
      sum: { key: 'poids', equals: 100 },
      preset: presetRows,
      presets: PRESETS, // exposé pour les tests (chaque grille type totalise 100)
      help: { fr: 'Les poids doivent totaliser 100. Laissez vide pour que l\'IA propose une grille adaptée à votre besoin.', en: 'Weights must add up to 100. Leave empty for the AI to suggest a grid suited to your need.' },
      addLabel: { fr: 'Ajouter un critère', en: 'Add a criterion' }
    })
  ],

  prompt: {
    roleFocus: {
      fr: 'Ta mission : comparer les offres de façon objective et traçable, pour que la décision puisse être justifiée devant un tiers.',
      en: 'Your mission: compare the offers objectively and traceably, so the decision can be justified to a third party.'
    },
    context: [
      {
        fr: 'Je dois choisir entre les offres décrites dans <offres> pour répondre au besoin décrit dans <besoin>. Le coût total se calcule sur {{HORIZON}}.',
        en: 'I need to choose between the offers described in <offers> to meet the need described in <need>. Total cost is calculated over {{HORIZON}}.'
      }
    ],
    data: [
      { tag: { fr: 'besoin', en: 'need' }, items: ['CATEGORIE', 'BESOIN', 'VOLUME', 'ELIMINATOIRES'] },
      {
        tag: { fr: 'offres', en: 'offers' },
        items: [{
          key: 'OFFRES',
          render: (rows, v, locale) => {
            const fr = locale === 'fr'
            const label = key => `${localize(OFFER_TEXTS[key].label(v), locale)}${fr ? ' : ' : ': '}`
            // Une fiche encore vide n'apparaît pas ; un nom manquant s'affiche « […] » comme tout champ à remplir.
            return rows.filter(r => !['nom', 'prix', 'conditions', 'caracteristiques'].every(k => blank(r[k])))
              .map((r, i) => `${fr ? 'Offre' : 'Offer'} ${i + 1} — ${blank(r.nom) ? '[…]' : r.nom.trim()}`
              + line(label('prix'), r.prix)
              + line(label('conditions'), r.conditions)
              + line(label('caracteristiques'), r.caracteristiques)
            ).join('\n')
          }
        }]
      },
      {
        tag: { fr: 'criteres', en: 'criteria' },
        items: [{
          key: 'CRITERES',
          render: (rows, v, locale) => rows.map(r => `- ${r.critere.trim()}${locale === 'fr' ? ' : ' : ': '}${r.poids}`).join('\n')
        }]
      }
    ],
    task: [
      {
        fr: '1. Extrais pour chaque offre les informations comparables : prix et modèle de tarification, engagement, frais annexes, caractéristiques clés, limites.',
        en: '1. Extract the comparable information for each offer: price and pricing model, commitment, extra fees, key features, limits.'
      },
      {
        fr: '2. Applique les critères éliminatoires : écarte les offres non conformes en expliquant pourquoi. Une offre pour laquelle l\'information manque n\'est pas écartée, mais signalée.',
        en: '2. Apply the knock-out criteria: rule out non-compliant offers and explain why. An offer with missing information is not ruled out but flagged.',
        when: filled('ELIMINATOIRES')
      },
      {
        fr: '3. Ramène les prix sur une base commune (coût annuel pour le volume ou le montant du besoin), puis calcule le coût total sur {{HORIZON}} : coûts récurrents, frais initiaux et frais annexes connus (par exemple licences et mise en place, ou mensualités, assurance et frais de dossier). Montre chaque calcul.',
        en: '3. Bring prices to a common basis (annual cost for the volume or amount needed), then calculate the total cost over {{HORIZON}}: recurring costs, upfront fees and known extra fees (for example licences and setup, or monthly repayments, insurance and arrangement fees). Show every calculation.'
      },
      {
        fr: '4. Utilise la grille de critères fournie, avec ses poids sur 100.',
        en: '4. Use the criteria grid provided, with its weights out of 100.',
        when: filled('CRITERES')
      },
      {
        fr: '4. Propose une grille de 4 à 6 critères pondérés (total 100) adaptée au besoin, signalée [GRILLE PROPOSÉE].',
        en: '4. Suggest a grid of 4 to 6 weighted criteria (total 100) suited to the need, marked [SUGGESTED GRID].',
        when: missing('CRITERES')
      },
      {
        fr: '5. Note chaque offre retenue de 0 à 5 sur chaque critère, avec une justification d\'une ligne, puis calcule son score pondéré sur 100 : somme de (note / 5 × poids).',
        en: '5. Score each remaining offer from 0 to 5 on each criterion, with a one-line justification, then calculate its weighted score out of 100: sum of (score / 5 × weight).'
      },
      {
        fr: '6. Classe les offres et recommande : le meilleur choix global, le meilleur rapport qualité / prix, et le choix à privilégier si le budget est la contrainte n° 1. Si deux offres sont à moins de 5 points, dis-le : elles se départagent alors sur un autre critère, que tu nommes.',
        en: '6. Rank the offers and recommend: the best overall choice, the best value for money, and the choice to favour if budget is the top constraint. If two offers are less than 5 points apart, say so: they are then decided on another criterion, which you name.'
      },
      {
        fr: '7. Liste les points à clarifier avec les fournisseurs avant de signer.',
        en: '7. List the points to clarify with suppliers before signing.'
      }
    ],
    mode: [
      {
        fr: '- Toutes les valeurs comparées viennent des offres ou des sources consultées : aucun prix, aucune fonctionnalité ni condition inventée.',
        en: '- Every value compared comes from the offers or consulted sources: no invented price, feature or condition.'
      },
      {
        fr: '- Information absente : écris « Non communiqué », attribue la note 0 sur le critère concerné et ajoute-la aux points à clarifier.',
        en: '- Missing information: write "Not provided", give a score of 0 on the criterion concerned and add it to the points to clarify.'
      },
      {
        fr: '- Logiciel : vérifie les limites de chaque formule (nombre d\'utilisateurs, stockage, fonctionnalités réservées aux formules supérieures).',
        en: '- Software: check each plan\'s limits (number of users, storage, features reserved for higher plans).',
        when: is('CATEGORIE', 'logiciel')
      },
      {
        fr: '- Produit : compare à usage équivalent, en intégrant livraison, installation, garantie et consommables connus.',
        en: '- Product: compare for equivalent use, including known delivery, installation, warranty and consumables.',
        when: is('CATEGORIE', 'materiel')
      },
      {
        fr: '- Prestation : compare à périmètre équivalent (nombre de jours, livrables) et signale tout écart de périmètre entre les offres.',
        en: '- Service: compare for an equivalent scope (number of days, deliverables) and flag any scope difference between offers.',
        when: is('CATEGORIE', 'prestation')
      },
      {
        fr: '- Crédit : compare le coût total du crédit (intérêts, assurance emprunteur, frais de dossier et de garantie) et le TAEG, à montant et durée identiques. Ne calcule pas une mensualité si le taux ou la durée manque. Précise que cette comparaison ne remplace pas l\'avis d\'un conseiller habilité.',
        en: '- Loan: compare the total cost of credit (interest, loan insurance, arrangement and guarantee fees) and the APR, for the same amount and duration. Do not calculate a monthly payment if the rate or duration is missing. State that this comparison does not replace advice from a licensed adviser.',
        when: is('CATEGORIE', 'credit')
      },
      {
        fr: '- Assurance : compare à garanties équivalentes et signale chaque franchise, plafond ou exclusion qui change le niveau de protection.',
        en: '- Insurance: compare for equivalent cover and flag every deductible, cap or exclusion that changes the level of protection.',
        when: is('CATEGORIE', 'assurance')
      },
      {
        fr: '- Énergie / télécoms : calcule le coût annuel à partir de la consommation ou de l\'usage indiqué ; s\'il manque, signale-le au lieu de le supposer.',
        en: '- Energy / telecoms: calculate the annual cost from the stated consumption or usage; if it is missing, flag it instead of assuming it.',
        when: is('CATEGORIE', 'energie')
      }
    ],
    format: [
      { fr: 'Commence par la recommandation en 2 phrases.', en: 'Start with the recommendation in 2 sentences.', when: formatIs('TABLEAU', 'TEXTE') },
      {
        fr: 'Puis : les calculs de coût total, le tableau de comparaison (une colonne par offre ; une ligne par critère avec la note, puis le coût total, le score pondéré et le rang), les justifications des notes et les points à clarifier.',
        en: 'Then: the total cost calculations, the comparison table (one column per offer; one row per criterion with the score, then total cost, weighted score and rank), the score justifications and the points to clarify.',
        when: formatIs('TABLEAU')
      },
      {
        fr: 'Puis une note de décision rédigée avec intertitres : coûts, comparaison critère par critère, classement, points à clarifier.',
        en: 'Then a written decision memo with headings: costs, criterion-by-criterion comparison, ranking, points to clarify.',
        when: formatIs('TEXTE')
      },
      jsonFormat({
        fr: '{"grille_proposee": false, "criteres": [{"critere": "", "poids": 0}], "offres": [{"nom": "", "eliminee": false, "motif_elimination": "", "cout_total": 0, "calcul_cout": "", "notes": [{"critere": "", "note": 0, "justification": ""}], "score": 0, "rang": 0}], "recommandation": {"global": "", "qualite_prix": "", "budget": ""}, "points_a_clarifier": []}',
        en: '{"suggested_grid": false, "criteria": [{"criterion": "", "weight": 0}], "offers": [{"name": "", "ruled_out": false, "ruled_out_reason": "", "total_cost": 0, "cost_calculation": "", "scores": [{"criterion": "", "score": 0, "justification": ""}], "weighted_score": 0, "rank": 0}], "recommendation": {"overall": "", "value_for_money": "", "budget": ""}, "points_to_clarify": []}'
      }),
      csvFormat(
        { fr: 'Offre;Critère;Poids;Note;Justification', en: 'Offer;Criterion;Weight;Score;Justification' },
        {
          fr: 'Une ligne par offre et par critère, puis une ligne par offre avec le critère « TOTAL », le coût total en poids et le score pondéré en note.',
          en: 'One row per offer and criterion, then one row per offer with the criterion "TOTAL", the total cost as weight and the weighted score as score.'
        }
      )
    ],
    constraints: [
      { fr: '- Compare des offres, pas des marques : aucun jugement sur un fournisseur qui ne repose pas sur les données.', en: '- Compare offers, not brands: no judgement on a supplier that is not based on the data.' },
      { fr: '- Montre les calculs en clair (ex. « 12 € × 40 utilisateurs × 12 mois = 5 760 € par an »).', en: '- Show calculations in plain text (e.g. "€12 × 40 users × 12 months = €5,760 per year").', when: formatIs('TABLEAU', 'TEXTE') }
    ],
    quality: [
      { fr: '- [ ] Chaque score pondéré se recalcule à partir des notes et des poids affichés.', en: '- [ ] Every weighted score can be recalculated from the scores and weights shown.' },
      { fr: '- [ ] Les coûts totaux utilisent le même volume et le même horizon pour toutes les offres.', en: '- [ ] Total costs use the same volume and horizon for every offer.' },
      { fr: '- [ ] Aucune valeur absente n\'a été estimée.', en: '- [ ] No missing value has been estimated.' },
      strictFormatCheck()
    ]
  }
}
