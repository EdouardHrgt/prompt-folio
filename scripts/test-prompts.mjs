/**
 * Test du moteur de prompts, sans Nuxt : `node scripts/test-prompts.mjs`
 * Génère des prompts d'exemple (FR + EN) dans scripts/output/ et vérifie la validation.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { DOMAINS } from '../app/data/prompts/index.js'
import { buildPrompt, validatePrompt, getInitialValues, getFormSteps, createItem, promptStats, fieldText } from '../app/utils/prompt-builder.js'

const out = new URL('./output/', import.meta.url)
mkdirSync(out, { recursive: true })

let failures = 0
const check = (cond, label) => {
  if (!cond) { failures++; console.log('  ✗', label) } else console.log('  ✓', label)
}

const tpl = id => DOMAINS[0].templates.find(t => t.id === id)

const CASES = {
  'gp-01': {
    OBJECTIF: 'Refondre le site e-commerce B2B et ajouter le paiement en ligne',
    LIVRABLE: 'Site en production',
    PERIMETRE: 'Inclus : catalogue, panier, paiement CB.\nExclu : application mobile.',
    ECHEANCE: '2027-03-15',
    EQUIPE: '3 développeurs, 1 designer',
    SECTEUR: 'retail',
    FORMAT: 'CSV'
  },
  'gp-02': {
    ESTIMATION: 'trois-points',
    DATE_DEBUT: '2027-01-06',
    TACHES: [
      { id: 'A', intitule: 'Cadrage', optimiste: 2, probable: 3, pessimiste: 5, predecesseurs: [] },
      { id: 'B', intitule: 'Maquettes', optimiste: 3, probable: 5, pessimiste: 8, predecesseurs: ['A'] },
      { id: 'C', intitule: 'Développement', optimiste: 8, probable: 10, pessimiste: 15, predecesseurs: ['B'] },
      { id: 'D', intitule: 'Recette', optimiste: 2, probable: 3, pessimiste: 4, predecesseurs: ['C'] }
    ],
    POSTURE: 'pedagogue'
  },
  'gp-03': {
    NOM_PROJET: 'Déploiement CRM — 4 agences',
    INDICATEURS: [
      { axe: 'couts', libelle: 'Budget total', prevu: '120', reel: '134', unite: 'k€', positif_si_hausse: false },
      { axe: 'kpi', libelle: 'Taux d\'adoption', prevu: '80', reel: '86', unite: '%', positif_si_hausse: true }
    ],
    RETOURS: [{ type: 'difficulte', texte: 'Recette trop courte' }],
    PUBLIC: 'Comité de direction',
    SOURCES: [
      { type: 'texte', titre: 'Compte rendu du comité de clôture', texte: 'Le comité note un dépassement lié à la reprise des données.', usage: 'reference', note: '' },
      { type: 'lien', titre: 'Note de cadrage', url: 'https://intranet.exemple.fr/cadrage', usage: 'contexte', note: '' }
    ],
    FORMAT: 'SLIDES'
  },
  'gp-04': {
    OBJECTIF_PRESENTATION: 'Obtenir le go et 80 k€ de budget',
    PUBLIC: 'COMEX, sensible au ROI',
    CONTEXTE_PROBLEME: 'Les commandes B2B passent encore par email.',
    SOLUTION: 'Portail de commande en ligne',
    MODE: 'CREATIF',
    AUDACE: 4,
    INFOS: 'web',
    PREVIEW: false,
    EXEMPLE: 'Slide 1 — Nous perdons 2 jours par commande\n• …'
  },
  'vt-01': {
    CANAL: 'email',
    NOM_OFFRE: 'Planif\'RH',
    OFFRE: 'Logiciel SaaS de planning des équipes postées, avec application mobile.',
    PRIX: '9 € / utilisateur / mois',
    DIFFERENCIANTS: ['Hébergé en France', 'Mise en route en 1 semaine'],
    INTERLOCUTEUR: 'DRH',
    TAILLE_CIBLE: 'eti',
    ENJEUX: 'Turnover élevé, plannings sur Excel.',
    PREUVES: [{ type: 'chiffre', texte: '−30 % de temps de planification chez Transports Martin' }],
    CONCURRENTS: ['Excel'],
    OBJECTIONS: ['Trop cher']
  },
  'vt-02': {
    BESOIN: 'Outil de visioconférence pour remplacer 3 abonnements',
    VOLUME: '40 utilisateurs',
    ELIMINATOIRES: ['Hébergement UE'],
    OFFRES: [
      { nom: 'Fournisseur A', prix: '12 € / utilisateur / mois', conditions: 'Engagement 12 mois', caracteristiques: 'SSO, enregistrement' },
      { nom: 'Fournisseur B', prix: '450 € / mois', conditions: '', caracteristiques: '' }
    ],
    CRITERES: [{ critere: 'Prix', poids: 40 }, { critere: 'Sécurité', poids: 35 }, { critere: 'Support', poids: 25 }],
    FORMAT: 'JSON'
  },
  'vt-03': {
    POSITION: 'acheteur',
    OBJET: 'Renouvellement du contrat de maintenance pour 3 ans',
    AUTRE_PARTIE: 'TechServices, commercial grands comptes',
    RELATION: 'reguliere',
    OBJECTIF_NEGO: '40 000 € sur 3 ans, interventions sous 4 h',
    SEUIL: '46 000 €',
    REPLI: 'Deux autres prestataires consultés, offre à 44 000 €',
    POINTS: [{ sujet: 'Prix', vise: '40 000 €', cede: 'jusqu\'à 44 000 €' }, { sujet: 'Durée', vise: '3 ans', cede: '4 ans' }],
    AUTRE_INFOS: 'Ils veulent sécuriser le chiffre d\'affaires avant leur clôture annuelle en juin.'
  },
  'vt-04': {
    TYPE_ANNONCE: 'immobilier',
    NOM_ARTICLE: 'Maison de ville avec jardin',
    SURFACE: '95 m², terrain de 300 m²',
    PIECES: '5 pièces dont 3 chambres',
    LOCALISATION: 'Nantes, quartier Saint-Félix',
    DPE: 'C',
    DESCRIPTION: 'Séjour traversant de 35 m², cuisine refaite en 2023, cellier.',
    PRIX: '329 000 € honoraires inclus',
    POINTS_FORTS: ['Écoles à pied', 'Tram à 300 m'],
    POINTS_FAIBLES: 'Pas de garage, salle de bains à rafraîchir.',
    CIBLE_ANNONCE: 'Famille avec enfants'
  },
  'vt-05': {
    CANAL_SEQ: 'mixte',
    OBJECTIF_SEQ: 'demo',
    NB_MESSAGES: 5,
    NOM_OFFRE: 'Planif\'RH',
    OFFRE: 'Logiciel SaaS de planning des équipes postées.',
    INTERLOCUTEUR: 'DRH',
    ENJEUX: 'Turnover élevé.',
    CONTEXTE_PROSPECT: 'Annonce l\'ouverture d\'un 3e entrepôt et recrute 40 préparateurs.',
    PREUVES: [{ type: 'chiffre', texte: '−30 % de temps de planification chez Transports Martin' }],
    FORMAT: 'CSV'
  },
  'rd-01': {
    TEXTE_SOURCE: 'Bonjour, suite a notre réunion de mardi je vous confirme que le projet Planif\'RH demarrera le 3 mars, sous réserve de validation du budget de 45 000 €.',
    OBJECTIFS_REECRITURE: ['corriger', 'raccourcir', 'ton'],
    LONGUEUR_CIBLE: '-25',
    TON_CIBLE: 'chaleureux',
    A_PRESERVER: ['Planif\'RH', '45 000 €'],
    TYPE_TEXTE: 'email'
  },
  'rd-02': {
    SITUATION: 'mauvaise-nouvelle',
    RELATION_DEST: 'client',
    DESTINATAIRE: 'Claire Martin, directrice des opérations',
    FAITS: 'La livraison prévue le 1er mars aura 2 semaines de retard à cause d\'une pénurie de composants chez notre fournisseur.',
    ISSUE: 'Faire accepter le nouveau délai du 15 mars sans perdre le client.',
    A_PRESERVER_EMAIL: ['relation', 'credibilite'],
    ECHANGES: 'Pouvez-vous me confirmer la date de livraison ? Nous avons calé notre lancement dessus.'
  }
}

for (const domain of DOMAINS.filter(d => !d.comingSoon)) {
  for (const template of domain.templates) {
    console.log(`\n== ${template.id} — ${template.title.fr}`)
    const steps = getFormSteps(template)
    check(steps.length === 4 && steps.every(s => s.fields.length), 'étapes du formulaire générées')

    const empty = validatePrompt(template, getInitialValues(template, 'fr'), 'fr')
    check(empty.length > 0, `formulaire vide refusé (${empty.map(e => e.key).join(', ')})`)

    for (const locale of ['fr', 'en']) {
      const values = { ...getInitialValues(template, locale), ...CASES[template.id] }
      const errors = validatePrompt(template, values, locale)
      check(errors.length === 0, `cas d'exemple valide [${locale}]${errors.length ? ' → ' + JSON.stringify(errors) : ''}`)
      const prompt = buildPrompt(template, values, { locale })
      check(!/\{\{\w+\}\}/.test(prompt), `aucune variable non résolue [${locale}]`)
      check(!/\bundefined\b|\bnull\b|\[object/.test(prompt), `aucune valeur parasite [${locale}]`)
      const s = promptStats(prompt)
      console.log(`    ${locale}: ${s.words} mots, ~${s.tokens} tokens`)
      writeFileSync(new URL(`${template.id}.${locale}.txt`, out), prompt)
    }
  }
}

// Validation des réseaux de tâches
console.log('\n== validation GP-02')
const gp02 = tpl('gp-02')
const base = getInitialValues(gp02, 'fr')
const cyc = validatePrompt(gp02, { ...base, TACHES: [
  { id: 'A', intitule: 'a', duree: 1, predecesseurs: ['B'] },
  { id: 'B', intitule: 'b', duree: 1, predecesseurs: ['A'] }
] }, 'fr')
check(cyc.some(e => /circulaire/.test(e.message)), 'boucle détectée')
const unknown = validatePrompt(gp02, { ...base, TACHES: [
  { id: 'A', intitule: 'a', duree: 1, predecesseurs: ['Z'] },
  { id: 'B', intitule: 'b', duree: 1, predecesseurs: [] }
] }, 'fr')
check(unknown.some(e => /inexistante/.test(e.message)), 'prédécesseur inexistant détecté')
const tachesField = getFormSteps(gp02).find(s => s.id === 'contexte').fields.find(f => f.key === 'TACHES')
check(createItem(tachesField, [{ id: 'A' }, { id: 'B' }]).id === 'C', 'ID automatique suivant = C')

// Comparateur : offres pré-remplies, total des poids imposé
console.log('\n== validation VT-02')
const vt02 = DOMAINS.find(d => d.id === 'vente').templates.find(t => t.id === 'vt-02')
const vtBase = getInitialValues(vt02, 'fr')
check(vtBase.OFFRES.length === 2 && vtBase.OFFRES.every(o => o.nom === ''), '2 offres vides au départ')
const badSum = validatePrompt(vt02, { ...vtBase, ...CASES['vt-02'], CRITERES: [{ critere: 'Prix', poids: 60 }, { critere: 'Support', poids: 30 }] }, 'fr')
check(badSum.some(e => /doit faire 100 \(actuellement 90\)/.test(e.message)), 'total des poids ≠ 100 détecté')
const noGrid = validatePrompt(vt02, { ...vtBase, ...CASES['vt-02'], CRITERES: [] }, 'fr')
check(noGrid.length === 0, 'grille vide acceptée (l\'IA la propose)')
const oneOffer = validatePrompt(vt02, { ...vtBase, ...CASES['vt-02'], OFFRES: [CASES['vt-02'].OFFRES[0]] }, 'fr')
check(oneOffer.some(e => e.key === 'OFFRES'), 'une seule offre refusée')
check(/GRILLE PROPOSÉE/.test(buildPrompt(vt02, { ...vtBase, ...CASES['vt-02'], CRITERES: [] }, { locale: 'fr' })), 'grille proposée quand elle est vide')

// Argumentaire : professionnels / particuliers
const autre = buildPrompt(vt02, { ...vtBase, ...CASES['vt-02'], HORIZON: 'autre', HORIZON_AUTRE: '20 ans' }, { locale: 'fr' })
check(autre.includes('Le coût total se calcule sur 20 ans.') && autre.includes('coût total sur 20 ans'), 'horizon « Autre » : durée libre reprise dans le prompt')
check(validatePrompt(vt02, { ...vtBase, ...CASES['vt-02'], HORIZON: 'autre' }, 'fr').some(e => e.key === 'HORIZON_AUTRE'), 'horizon « Autre » : durée obligatoire')

const critField = vt02.fields.find(f => f.key === 'CRITERES')
for (const [cat, rows] of Object.entries(critField.presets)) {
  check(rows.reduce((a, r) => a + r[2], 0) === 100, `grille type « ${cat} » = 100`)
}
check(critField.preset({ CATEGORIE: 'credit' }, 'en')[0].critere === 'Total cost of credit', 'grille type traduite')
const credit = buildPrompt(vt02, { ...vtBase, ...CASES['vt-02'], CATEGORIE: 'credit' }, { locale: 'fr' })
check(credit.includes('Type d\'achat : crédit ou financement') && credit.includes('Taux et mensualité : 12 €') && credit.includes('- Crédit : compare le coût total'), 'type crédit : libellés des offres et règle adaptés')
check(!buildPrompt(vt02, { ...vtBase, ...CASES['vt-02'] }, { locale: 'fr' }).includes('Type d\'achat'), 'type général : aucune ligne ajoutée')

console.log('\n== VT-01 particuliers')
const vt01 = DOMAINS.find(d => d.id === 'vente').templates.find(t => t.id === 'vt-01')
const b2c = { ...getInitialValues(vt01, 'fr'), ...CASES['vt-01'], TYPE_CLIENT: 'b2c', PROFIL_CLIENT: 'Jeune couple' }
check(validatePrompt(vt01, b2c, 'fr').length === 0, 'particulier valide sans fonction (champ masqué)')
const pB2c = buildPrompt(vt01, b2c, { locale: 'fr' })
check(pB2c.includes('Profil du client : Jeune couple') && pB2c.includes('Client particulier'), 'profil et règle « particulier » dans le prompt')
check(!pB2c.includes('Interlocuteur : DRH') && !pB2c.includes('Taille :'), 'fonction et taille masquées absentes du prompt')
check(validatePrompt(vt01, { ...b2c, PROFIL_CLIENT: '' }, 'fr').some(e => e.key === 'PROFIL_CLIENT'), 'profil obligatoire pour un particulier')

// Négociation, annonce, prospection : choix qui adaptent le formulaire et le prompt
console.log('\n== VT-03 / VT-04 / VT-05')
const vente = id => DOMAINS.find(d => d.id === 'vente').templates.find(t => t.id === id)
const vt03 = vente('vt-03')
const buyer = buildPrompt(vt03, { ...getInitialValues(vt03, 'fr'), ...CASES['vt-03'] }, { locale: 'fr' })
check(buyer.includes('Je suis acheteur') && buyer.includes('ne révèle jamais ton budget maximum') && !buyer.includes('- Vendeur :'), 'négociation : règle acheteur seulement')
check(buyer.includes('- Prix : je vise 40 000 € ; je peux céder jusqu\'à 44 000 €'), 'négociation : points négociables reformulés')
const seuilField = vt03.fields.find(f => f.key === 'SEUIL')
check(fieldText(seuilField.label, { POSITION: 'vendeur' }).fr.startsWith('Prix plancher') && fieldText(seuilField.label, { POSITION: 'acheteur' }).fr.startsWith('Budget maximum'), 'négociation : libellé du seuil selon le rôle')
check(vt03.fields.find(f => f.key === 'POINTS').preset({}, 'fr').length === 4, 'négociation : sujets courants pré-remplis')
const vt04 = vente('vt-04')
const immo = buildPrompt(vt04, { ...getInitialValues(vt04, 'fr'), ...CASES['vt-04'] }, { locale: 'fr' })
check(immo.includes('Classe énergie (DPE) : C') && immo.includes('mentions obligatoires'), 'annonce immobilière : DPE et mentions obligatoires')
const produit = buildPrompt(vt04, { ...getInitialValues(vt04, 'fr'), ...CASES['vt-04'], TYPE_ANNONCE: 'produit' }, { locale: 'fr' })
check(!produit.includes('DPE') && !produit.includes('Surface') && produit.includes('5 points clés'), 'fiche produit : champs immobiliers masqués, points clés ajoutés')
const vt05 = vente('vt-05')
const prosB2c = buildPrompt(vt05, { ...getInitialValues(vt05, 'fr'), ...CASES['vt-05'], TYPE_CLIENT: 'b2c', PROFIL_CLIENT: 'Famille' }, { locale: 'fr' })
check(prosB2c.includes('consentement préalable') && !prosB2c.includes('fonction de l\'interlocuteur'), 'prospection particuliers : règle de consentement')
const prosLinkedin = buildPrompt(vt05, { ...getInitialValues(vt05, 'fr'), ...CASES['vt-05'], CANAL_SEQ: 'linkedin' }, { locale: 'fr' })
check(prosLinkedin.includes('300 caractères') && !prosLinkedin.includes('ne plus être contacté') && !prosLinkedin.includes('message vocal'), 'prospection LinkedIn : règles propres au canal')

// Rédaction : choix multiple, format unique, règle par situation
console.log('\n== RD-01 / RD-02')
const redac = id => DOMAINS.find(d => d.id === 'redaction').templates.find(t => t.id === id)
const rd01 = redac('rd-01')
const rw = buildPrompt(rd01, { ...getInitialValues(rd01, 'fr'), ...CASES['rd-01'] }, { locale: 'fr' })
check(rw.includes('Objectifs : corriger, raccourcir, changer de ton.'), 'réécriture : objectifs cochés listés dans l\'ordre')
check(rw.includes('Adopte un ton chaleureux') && !rw.includes('Conserve le ton d\'origine') && !rw.includes('Adapte le texte à ce public'), 'réécriture : étapes selon les objectifs')
check(!getFormSteps(rd01).find(s => s.id === 'reponse').fields.some(f => f.key === 'FORMAT') && rw.includes('### FORMAT DE SORTIE : Texte rédigé'), 'format unique : pas de choix, section format conservée')
check(validatePrompt(rd01, { ...getInitialValues(rd01, 'fr'), ...CASES['rd-01'], OBJECTIFS_REECRITURE: [] }, 'fr').some(e => e.key === 'OBJECTIFS_REECRITURE'), 'réécriture : au moins un objectif')
check(validatePrompt(rd01, { ...getInitialValues(rd01, 'fr'), ...CASES['rd-01'], OBJECTIFS_REECRITURE: ['public'] }, 'fr').some(e => e.key === 'PUBLIC_CIBLE'), 'réécriture : public obligatoire si « Adapter à un public »')
const rd02 = redac('rd-02')
const mail = buildPrompt(rd02, { ...getInitialValues(rd02, 'fr'), ...CASES['rd-02'] }, { locale: 'fr' })
check(mail.includes('pour annoncer une mauvaise nouvelle') && mail.includes('Annonce la nouvelle dès le premier paragraphe') && !mail.includes('Dis non clairement'), 'email : une seule règle, celle de la situation')
check(mail.includes('À préserver : la relation, ma crédibilité'), 'email : enjeux cochés dans les données')

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent.')
process.exit(failures ? 1 : 0)
