/**
 * Test du moteur de prompts, sans Nuxt : `node scripts/test-prompts.mjs`
 * Génère des prompts d'exemple (FR + EN) dans scripts/output/ et vérifie la validation.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { DOMAINS } from '../app/data/prompts/index.js'
import { buildPrompt, validatePrompt, getInitialValues, getFormSteps, createItem, promptStats } from '../app/utils/prompt-builder.js'

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

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent.')
process.exit(failures ? 1 : 0)
