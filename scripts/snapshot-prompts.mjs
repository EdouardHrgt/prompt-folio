/**
 * Test de non-régression des prompts : `npm run test:snapshot`
 *
 * Génère le prompt de chaque template pour un grand nombre de combinaisons
 * (langue × format × mode × périmètre × aperçu × sources × exemple) et compare
 * leur empreinte (SHA-1) à celle enregistrée dans scripts/snapshots/prompts.json.
 *
 *   node scripts/snapshot-prompts.mjs            → compare (échec si un prompt a changé)
 *   node scripts/snapshot-prompts.mjs --update   → enregistre les empreintes actuelles
 *
 * À lancer après toute modification du moteur ou des données : si un prompt change
 * sans que ce soit voulu, le test le signale.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DOMAINS } from '../app/data/prompts/index.js'
import { buildPrompt, getInitialValues } from '../app/utils/prompt-builder.js'

const FILE = new URL('./snapshots/prompts.json', import.meta.url)
const update = process.argv.includes('--update')

// Valeurs d'exemple : tous les champs de contexte remplis, pour exercer chaque bloc de données.
const SAMPLE = {
  'gp-01': { OBJECTIF: 'Refondre le site B2B', LIVRABLE: 'Site en production', PERIMETRE: 'Catalogue, panier.\nHors mobile.', ECHEANCE: '2027-03-15', BUDGET: '60 k€', EQUIPE: '3 devs', AUTRES_CONTRAINTES: 'Stack Vue' },
  'gp-02': { DATE_DEBUT: '2027-01-06', TACHES: [{ id: 'A', intitule: 'Cadrage', duree: 3, optimiste: 2, probable: 3, pessimiste: 5, predecesseurs: [] }, { id: 'B', intitule: 'Dev', duree: 10, optimiste: 8, probable: 10, pessimiste: 15, predecesseurs: ['A'] }] },
  'gp-03': { NOM_PROJET: 'CRM', EQUIPE: '1 développeur en solo', OBJECTIF_PROJET: 'Déployer le CRM', INDICATEURS: [{ axe: 'couts', libelle: 'Budget', prevu: '120', reel: '134', unite: 'k€', positif_si_hausse: false }], AUTRES_CHIFFRES: '4 agences', RETOURS: [{ type: 'difficulte', texte: 'Recette courte' }], PUBLIC: 'Comité de direction' },
  'gp-04': { OBJECTIF_PRESENTATION: 'Obtenir le go', PUBLIC: 'COMEX', CONTEXTE_PROBLEME: 'Commandes par email', SOLUTION: 'Portail', BENEFICES: '-30 % de délai', PLANNING: 'T1', BUDGET_RESSOURCES: '80 k€', EQUIPE: '4 pers.', RISQUES: 'Adoption', AUTRES_NOTES: 'RAS' },
  'vt-01': { NOM_OFFRE: 'Planif', OFFRE: 'Planning RH SaaS', PRIX: '9 €/mois', DIFFERENCIANTS: ['Hébergé en France'], INTERLOCUTEUR: 'DRH', TAILLE_CIBLE: 'eti', ENJEUX: 'Turnover', PREUVES: [{ type: 'chiffre', texte: '-30 % de temps' }], CONCURRENTS: ['Excel'], OBJECTIONS: ['Trop cher'] },
  'vt-02': { BESOIN: 'Visioconférence', VOLUME: '40 utilisateurs', HORIZON: '3', ELIMINATOIRES: ['Hébergement UE'], OFFRES: [{ nom: 'A', prix: '12 €', conditions: '12 mois', caracteristiques: 'SSO' }, { nom: 'B', prix: '10 €', conditions: '', caracteristiques: '' }], CRITERES: [{ critere: 'Prix', poids: 60 }, { critere: 'Sécurité', poids: 40 }], PUBLIC: 'DAF' },
  'vt-03': { OBJET: 'Renouvellement maintenance', AUTRE_PARTIE: 'Groupe Martin', RELATION: 'reguliere', OBJECTIF_NEGO: '48 k€', SEUIL: '42 k€', REPLI: 'Autre client', POINTS: [{ sujet: 'Prix', vise: '48 k€', cede: '3 %' }, { sujet: 'Paiement', vise: '30 j', cede: '' }], AUTRE_INFOS: 'Budget voté en mars' },
  'vt-04': { NOM_ARTICLE: 'Maison de ville', SURFACE: '95 m²', PIECES: '5 pièces', LOCALISATION: 'Nantes', DPE: 'C', ETAT: 'bon', DESCRIPTION: 'Séjour 35 m²', PRIX: '329 000 €', POINTS_FORTS: ['Jardin'], POINTS_FAIBLES: 'Pas de garage', CIBLE_ANNONCE: 'Famille avec enfants', SUPPORT: 'annonces' },
  'vt-05': { OBJECTIF_SEQ: 'rdv', NB_MESSAGES: 4, NOM_OFFRE: 'Planif', OFFRE: 'Planning RH', DIFFERENCIANTS: ['Hébergé en France'], INTERLOCUTEUR: 'DRH', TAILLE_CIBLE: 'eti', ENJEUX: 'Turnover', CONTEXTE_PROSPECT: 'Recrute 20 personnes', PREUVES: [{ type: 'chiffre', texte: '-30 %' }] },
  'rd-01': { TEXTE_SOURCE: 'Bonjour, suite a notre réunion je vous confirme le lancement.', LONGUEUR_CIBLE: '-50', TON_CIBLE: 'chaleureux', PUBLIC_CIBLE: 'Clients', A_PRESERVER: ['Planif'], TYPE_TEXTE: 'email', EXPLIQUER: true },
  'rd-02': { RELATION_DEST: 'client', DESTINATAIRE: 'Claire', FAITS: 'Livraison en retard de 2 semaines', ISSUE: 'Garder le client', A_PRESERVER_EMAIL: ['relation', 'calendrier'], ECHANGES: 'Où en est ma commande ?' }
}
const VARIANTS = {
  'gp-01': ['GRANULARITE', ['macro', 'standard', 'fine']],
  'gp-02': ['ESTIMATION', ['simple', 'trois-points']],
  'vt-01': ['CANAL', ['decouverte', 'email', 'ao']],
  'vt-03': ['POSITION', ['vendeur', 'acheteur']],
  'vt-04': ['TYPE_ANNONCE', ['immobilier', 'produit', 'service', 'occasion']],
  'vt-05': ['CANAL_SEQ', ['email', 'linkedin', 'mixte']],
  'rd-01': ['OBJECTIFS_REECRITURE', [['corriger'], ['raccourcir', 'ton'], ['clarifier', 'public', 'traduire']]],
  'rd-02': ['SITUATION', ['refuser', 'relancer', 'mauvaise-nouvelle', 'desaccord', 'recadrer', 'excuser', 'reclamer', 'faveur']]
}
const SOURCES = [
  { type: 'lien', titre: 'Note', url: 'https://exemple.com', usage: 'contexte', note: 'v2' },
  { type: 'texte', titre: 'CR', texte: 'Dépassement lié aux données.', usage: 'reference', note: '' },
  { type: 'document', titre: 'Devis', fichier: 'devis.pdf', usage: 'reference', note: '' }
]

const sha = s => createHash('sha1').update(s).digest('hex')
const current = {}
const prompts = {} // textes complets (option --dump)

for (const template of DOMAINS.flatMap(d => d.templates)) {
  // Choix qui changent la structure du prompt : une valeur testée par combinaison.
  const [variantKey, variantValues] = VARIANTS[template.id] ?? [null, [null]]
  for (const locale of ['fr', 'en']) {
    for (const FORMAT of template.formats) {
      for (const MODE of template.modes) {
        for (const INFOS of ['ferme', 'standard', 'web']) {
          for (const PREVIEW of [false, true]) {
            for (const withSources of [false, true]) {
              for (const variant of variantValues) {
                  const values = {
                    ...getInitialValues(template, locale),
                    ...SAMPLE[template.id],
                    FORMAT, MODE, INFOS, PREVIEW,
                    SOURCES: withSources ? SOURCES : [],
                    CITATIONS: withSources,
                    EXEMPLE: withSources ? 'Exemple de rendu' : '',
                    SECTEUR: withSources ? 'industrie' : '',
                    POSTURE: withSources ? 'challenger' : 'expert',
                    LANGUE: withSources ? (locale === 'fr' ? 'en' : 'fr') : locale, // langue de réponse croisée
                    ...(variant && { [variantKey]: variant }),
                    // Champs facultatifs vidés une fois sur deux (VT) pour couvrir les étapes conditionnelles.
                    ...(!withSources && template.id === 'vt-01' && { OBJECTIONS: [] }),
                    ...(withSources && template.id === 'vt-01' && { TYPE_CLIENT: 'b2c', PROFIL_CLIENT: 'Jeune couple' }), // particulier : profil au lieu de fonction et taille
                    ...(!withSources && template.id === 'vt-02' && { CRITERES: [], ELIMINATOIRES: [] }),
                    ...(withSources && template.id === 'vt-02' && { HORIZON: 'autre', HORIZON_AUTRE: '20 ans', CATEGORIE: 'credit' }), // durée libre, type crédit
                    ...(!withSources && template.id === 'vt-03' && { SEUIL: '', POINTS: [] }),
                    ...(!withSources && template.id === 'vt-04' && { POINTS_FAIBLES: '', SUPPORT: 'vitrine' }),
                    ...(withSources && template.id === 'vt-05' && { TYPE_CLIENT: 'b2c', PROFIL_CLIENT: 'Famille avec enfants' }),
                    ...(!withSources && template.id === 'rd-01' && { EXPLIQUER: false, A_PRESERVER: [], TYPE_TEXTE: '' }),
                    ...(!withSources && template.id === 'rd-02' && { ECHANGES: '', RELATION_DEST: 'superieur' })
                  }
                  const key = [template.id, locale, FORMAT, MODE, INFOS, PREVIEW ? 'preview' : '-', withSources ? 'sources' : '-', variant].filter(Boolean).join('|')
                  const prompt = buildPrompt(template, values, { locale })
                  current[key] = sha(prompt)
                  prompts[key] = prompt
              }
            }
          }
        }
      }
    }
  }
}

const dumpIndex = process.argv.indexOf('--dump')
if (dumpIndex > 0) writeFileSync(process.argv[dumpIndex + 1], JSON.stringify(prompts))

const count = Object.keys(current).length
if (update || !existsSync(FILE)) {
  mkdirSync(new URL('./snapshots/', import.meta.url), { recursive: true })
  writeFileSync(FILE, JSON.stringify(current, null, 1) + '\n')
  console.log(`${count} empreintes enregistrées.`)
} else {
  const saved = JSON.parse(readFileSync(FILE, 'utf8'))
  const changed = Object.keys({ ...saved, ...current }).filter(k => saved[k] !== current[k])
  if (changed.length) {
    console.log(`✗ ${changed.length} prompt(s) différent(s) sur ${count} :`)
    changed.slice(0, 20).forEach(k => console.log('  ', k, saved[k] ? '' : '(nouvelle combinaison)', current[k] ? '' : '(combinaison disparue)'))
    process.exit(1)
  }
  console.log(`✓ ${count} prompts identiques à l'instantané.`)
}
