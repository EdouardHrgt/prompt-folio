/**
 * Import de tâches depuis un CSV collé (ex. sortie du template « Découper un projet en tâches »).
 * Reconnaît les en-têtes FR/EN ; sans en-tête reconnu, suppose l'ordre id;intitulé;durée;prédécesseurs.
 * Renvoie { rows } ou { error }.
 */

const COLUMNS = {
  id: ['id'],
  intitule: ['intitule', 'title', 'tache', 'task', 'nom', 'name', 'libelle'],
  duree: ['duree_jours', 'duration_days', 'duree', 'duration', 'jours', 'days'],
  optimiste: ['optimiste', 'optimistic', 'o'],
  probable: ['probable', 'most_likely', 'm'],
  pessimiste: ['pessimiste', 'pessimistic', 'p'],
  predecesseurs: ['depend_de', 'depends_on', 'predecesseurs', 'predecessors', 'dependances', 'dependencies']
}

const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '_')

function splitLine (line, sep) {
  const out = []
  let cur = ''
  let quoted = false
  for (const ch of line) {
    if (ch === '"') quoted = !quoted
    else if (ch === sep && !quoted) { out.push(cur); cur = '' } else cur += ch
  }
  out.push(cur)
  return out.map(c => c.trim())
}

const toNumber = v => {
  if (v == null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function parseTasksCsv (text) {
  const lines = String(text || '').split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { error: 'empty' }

  const first = lines[0]
  const sep = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0]
  const header = splitLine(first, sep).map(normalize)

  const index = {}
  for (const [key, names] of Object.entries(COLUMNS)) {
    const i = header.findIndex(h => names.includes(h))
    if (i >= 0) index[key] = i
  }

  let body = lines.slice(1)
  if (index.id === undefined) {
    // Pas d'en-tête reconnu : ordre par défaut, et la première ligne est une donnée.
    if (header.length < 3) return { error: 'header' }
    Object.assign(index, { id: 0, intitule: 1, duree: 2, predecesseurs: 3 })
    body = lines
  }

  // Séparateur des prédécesseurs : virgule, sauf si c'est déjà le séparateur de colonnes.
  const predSep = sep === ',' ? /[|\s]+/ : /[,|\s]+/

  const rows = body.map(line => {
    const cells = splitLine(line, sep)
    const cell = key => (index[key] !== undefined ? cells[index[key]] ?? '' : '')
    const preds = cell('predecesseurs')
    return {
      id: cell('id'),
      intitule: cell('intitule'),
      duree: toNumber(cell('duree')),
      optimiste: toNumber(cell('optimiste')),
      probable: toNumber(cell('probable')),
      pessimiste: toNumber(cell('pessimiste')),
      predecesseurs: preds && preds !== '-' ? preds.split(predSep).map(s => s.trim()).filter(Boolean) : []
    }
  }).filter(r => r.id)

  return rows.length ? { rows } : { error: 'empty' }
}
