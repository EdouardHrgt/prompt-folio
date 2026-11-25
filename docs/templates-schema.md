# Templates de prompts — schéma des données

Tout le contenu des prompts vit dans `app/data/prompts/`. Le moteur `app/utils/prompt-builder.js` transforme une définition de template et les valeurs du formulaire en prompt final.

```
app/
├── data/prompts/
│   ├── index.js              ← DOMAINS, getDomain(), getTemplate(), getTemplateBySlug()
│   ├── common.js             ← listes partagées (secteurs, postures, formats…) + champs des étapes communes
│   ├── blocks.js             ← textes fixes du prompt (titres de sections, règles sources, aperçu…)
│   ├── fields.js             ← bibliothèque de champs, niveau 1 : fabriques génériques (F.text, F.choice…)
│   ├── helpers.js            ← aides pour les textes : conditions (formatIs…) et formats (jsonFormat…)
│   └── gestion-projet/
│       ├── index.js          ← le domaine : libellés, slugs, rôles, templates
│       ├── roles.js          ← bibliothèque de rôles du domaine
│       ├── fields.js         ← bibliothèque de champs, niveau 2 : champs métier du domaine (PM.budget…)
│       └── gp-0X-….js        ← un fichier par template (niveau 3 : champs propres à la tâche)
├── utils/prompt-builder.js   ← moteur (auto-importé par Nuxt)
└── components/               ← un composant par type de champ (PromptField, FieldTable…)
scripts/test-prompts.mjs      ← tests du moteur : `npm run test:prompts`
scripts/snapshot-prompts.mjs  ← non-régression des prompts : `npm run test:snapshot`
```

## Conventions

- **Traductions :** tout texte est un objet `{ fr, en }`. `localize(obj, locale)` choisit la langue.
- **Options :** `{ value, label, hint?, prompt? }`. `label` = affiché dans l'UI, `prompt` = texte injecté dans le prompt (sinon le label).
- **Interpolation :** `{{CLÉ}}` dans un texte du prompt est remplacé par la valeur rendue du champ `CLÉ` (option traduite, date au format local, liste jointe par des virgules).
- **Fragments conditionnels :** `{ fr, en, when: values => booléen }`. Un fragment sans `when` est toujours inclus.
- **Visibilité des champs :** `showIf(values)` pour un champ, `showIf(item, values)` pour un sous-champ de répéteur. Un champ masqué n'est ni affiché ni validé.

## Bibliothèque de champs (3 niveaux)

Un champ n'est écrit qu'une fois, au niveau le plus général où il a du sens ; on surcharge seulement ce qui diffère.

```js
// Niveau 1 — fields.js : types génériques, valeurs par défaut saines (facultatif, vide)
F.text(key, label, options)            F.textarea / F.date / F.number / F.toggle / F.combobox / F.tags
F.choice(type, key, label, options, o) // type : 'segmented' | 'chips' | 'cards' | 'select'
F.slider(key, label, { min, max, default }, o)
F.repeater(key, label, itemFields, o)  F.table(key, label, itemFields, o)

// Niveau 2 — <domaine>/fields.js : champs métier partagés par les tâches du domaine
PM.objective()  PM.budget({ group: 'contraintes' })  PM.team({ label: { fr: 'Équipe', en: 'Team' } })

// Niveau 3 — dans le template : uniquement ce qui est propre à la tâche
F.choice('segmented', 'GRANULARITE', { fr: 'Niveau de détail', … }, [ … ])
```

`promptLabel` : libellé utilisé dans la section DONNÉES du prompt quand il diffère du libellé affiché (« Objectif du projet » à l'écran → « Objectif » dans le prompt).

## Aides pour les textes du prompt (helpers.js)

| Aide | Équivaut à |
|---|---|
| `formatIs('CSV', 'JSON')`, `formatIsNot('JSON')` | `v => ['CSV', 'JSON'].includes(v.FORMAT)` |
| `modeIs('FACTUEL')`, `modeIsNot('FACTUEL')` | `v => v.MODE === 'FACTUEL'` |
| `is('GRANULARITE', 'macro')`, `isNot(…)`, `filled('ECHEANCE')`, `missing('EQUIPE')` | conditions sur n'importe quel champ |
| `all(cond1, cond2)` | les deux conditions |
| `jsonFormat({ fr, en })` | « Uniquement du JSON valide… conforme à ce schéma : … » |
| `csvFormat(entêtes, note?)` | « Uniquement du CSV… Séparateur « ; », en-têtes : … » |
| `strictFormatCheck()` | ligne de contrôle « format respecté à la lettre » |

Les conditions s'utilisent aussi bien pour `when` (fragments) que pour `showIf` (champs).

## Étapes du formulaire

`getFormSteps(template)` renvoie 4 étapes. Seule l'étape `contexte` est propre au template.

| Étape | Champs | Source |
|---|---|---|
| `contexte` | Spécifiques au template | `template.fields` |
| `role` | ROLE, SECTEUR, POSTURE, ROLE_PRECISION (avancé) | `buildCommonFields()` |
| `reponse` | MODE, AUDACE, INFOS, FORMAT, PUBLIC, LONGUEUR, TON, LANGUE, EXEMPLE (avancé), PREVIEW | `buildCommonFields()` selon `template.response` |
| `sources` (facultative) | SOURCES (répéteur), CITATIONS | `buildCommonFields()` |

`INFOS` = périmètre des informations : `ferme` (uniquement les données fournies), `standard` (+ connaissances générales, sans web), `web` (+ recherche web). Valeur par défaut dans `template.defaults.INFOS`.

L'étape « Domaine / tâche » (choix du template) est gérée par l'UI avec `DOMAINS`.

Chaque étape déclare comment elle se résume une fois repliée (`summary` : `'filled'`, `'choices'` ou `{ count: 'CLÉ' }`) et si elle est à remplir (`required`) ou facultative (`optional`). Le moteur ne connaît aucune étape par son nom.

## Types de champs → composants Vue

| type | Composant suggéré | Remarque |
|---|---|---|
| `text`, `textarea`, `number`, `date` | champs natifs | `placeholder`, `help`, `min` |
| `select` | liste déroulante | `options` |
| `combobox` | liste + saisie libre | la valeur peut être hors liste (SECTEUR, PUBLIC) |
| `chips` | pastilles, choix unique | `recommended: true` sur une option = badge « recommandé » |
| `segmented` | boutons groupés | 2 à 4 options courtes |
| `cards` | grandes cartes | FORMAT : `icon` + `label` + `hint` |
| `slider` | curseur | `min`, `max`, `marks` (libellés par cran) |
| `toggle` | interrupteur | |
| `tags` | saisie d'étiquettes | valeur = tableau de chaînes |
| `repeater` | blocs répétables | `itemFields`, `min`, `max`, `addLabel`, `itemLabel` (titre de chaque bloc, ex. « Offre 1 »), `initialItems` (nombre de blocs vides au départ) |
| `table` | tableau éditable (FieldTable) | idem répéteur ; sous-champ `auto: 'letter'` = identifiant auto ; sous-champ `optionsFrom: 'rows.<id>'` = références vers d'autres lignes (doublons, références inexistantes et boucles validés) ; `import: { parser, help }` = import CSV ; `sum: { key, equals }` = total imposé d'une colonne, affiché en direct et validé (ex. poids = 100) ; `preset: (values, locale) => rows` = bouton « Partir d'une grille type » tant que le tableau est vide |
| `multiselect` | sélection multiple | dans les tableaux (prédécesseurs) |

Attributs d'affichage : `advanced: true` (derrière « Personnaliser »), `group` (regrouper visuellement des champs ; libellés dans `FIELD_GROUPS` de common.js).

## Définition d'un template

```js
export default {
  id: 'gp-02', domain: 'gestion-projet', version: '1.0.0',
  slug: { fr, en }, title: { fr, en }, summary: { fr, en }, warning?: { fr, en },

  roles: ['planificateur', …], defaultRole: 'planificateur',   // ids de roles.js
  modes: ['FACTUEL'],                    // 1 seul mode = pas de choix dans l'UI
  formats: ['TABLEAU_MERMAID', …],       // clés de FORMATS (common.js)
  defaults: { MODE, FORMAT, INFOS, PREVIEW, CITATIONS, AUDACE?, POSTURE? },
  response: { audace: bool, public: bool | 'required', longueur: bool, tons: ['neutre', …] | null },
  // optionnel : response.lengthScope = { fr, en } précise à quelles parties s'applique la longueur (ex. GP-03 : prose seulement)

  fields: [ … ],                         // étape « Votre contexte »

  prompt: {
    roleFocus: { fr, en },               // ajouté après la phrase d'identité du rôle
    context: [fragments],
    data: [{ tag: { fr, en }, items: ['CLÉ', …] }],    // libellé = promptLabel ou label du champ
          // ou { key, label?, render: (value, values, locale) => string } pour un rendu sur mesure
    task: [fragments],                   // renumérotés automatiquement
    mode: [fragments],
    format: [fragments],
    constraints: [fragments],
    quality: [fragments]
  }
}
```

## Structure du prompt généré

Le prompt est **compilé** : seul ce qui sert aux choix de l'utilisateur est inclus.

```
### RÔLE                      identité du rôle + roleFocus + secteur + précisions + posture
### CONTEXTE
### DONNÉES                   blocs <tag> … </tag> (blocs vides omis)
### SOURCES                   si des sources sont saisies
### TÂCHE                     étape 0 si aperçu activé
### MODE DE RÉPONSE : X       règles du mode choisi uniquement
### INFORMATIONS ET SOURCES   si sources, ou périmètre « fermé » ou « web »
### FORMAT DE SORTIE : X      format choisi uniquement + destinataire, longueur, ton, langue
### EXEMPLE DE RÉSULTAT       si un exemple est fourni
### CONTRAINTES               communes + template
### APERÇU AVANT GÉNÉRATION   si aperçu activé
### CONTRÔLE QUALITÉ
```

## Langues

- **Langue de l'interface et du prompt :** `locale` passé à `buildPrompt()` (en pratique, la langue de l'interface via `@nuxtjs/i18n`).
- **Langue de la réponse :** champ `LANGUE`, indépendant (par défaut = langue de l'interface).

## Ajouter un template

1. Créer `app/data/prompts/<domaine>/<id>-<nom>.js` en suivant le schéma ci-dessus, en réutilisant les champs de `fields.js` (niveau 1) et `<domaine>/fields.js` (niveau 2).
2. L'ajouter au tableau `templates` du `index.js` du domaine (et ses rôles à `roles.js` si besoin).
3. Ajouter un cas d'exemple dans `scripts/test-prompts.mjs` et dans `scripts/snapshot-prompts.mjs`, puis :
   `npm run test:prompts` et `npm run test:snapshot -- --update` (enregistre les empreintes du nouveau template).

## Ajouter un domaine

1. Créer le dossier `app/data/prompts/<domaine>/` avec `index.js`, `roles.js`, `fields.js` et ses templates.
2. L'ajouter à `DOMAINS` dans `app/data/prompts/index.js` (et retirer l'entrée « bientôt » correspondante).
3. Ajouter son icône à `components/DomainIcon.vue` si elle n'existe pas.

## Non-régression des prompts

`npm run test:snapshot` génère environ 1 400 prompts (toutes les combinaisons de langue, format, mode, périmètre, aperçu, sources…) et compare leur empreinte à `scripts/snapshots/prompts.json`. Après une modification du moteur ou des données :
- si le test passe, aucun prompt n'a changé ;
- s'il échoue alors que le changement est voulu, relire quelques prompts concernés puis enregistrer : `npm run test:snapshot -- --update`.

## Domaines actifs

| Domaine | Dossier | Champs partagés | Templates |
|---|---|---|---|
| Gestion de projet | `gestion-projet/` | `PM` (objectif, budget, équipe, risques…) | GP-01 à GP-04 |
| Vente & achats | `vente/` | `SALES` (offre, interlocuteur, preuves, concurrents) | VT-01 argumentaire, VT-02 comparateur |

Ajouter un domaine : créer son dossier (`roles.js`, `fields.js`, templates, `index.js`), l'importer dans `data/prompts/index.js`, puis ajouter ses valeurs d'exemple dans `scripts/snapshot-prompts.mjs` et `scripts/test-prompts.mjs`.

## Textes dynamiques et options « Autre »

- `label`, `placeholder`, `help` et `promptLabel` acceptent un objet `{ fr, en }` **ou une fonction des valeurs** qui en renvoie un (`fieldText()` dans le moteur). Exemple VT-02 : le sous-champ « Prix » devient « Taux et mensualité » quand le type d'achat est « Crédit ».
- Le `prompt` d'une option peut renvoyer vers un autre champ : `{ value: 'autre', prompt: { fr: '{{HORIZON_AUTRE}}' } }`, avec un champ `HORIZON_AUTRE` affiché par `showIf: is('HORIZON', 'autre')`.
- Un champ masqué par `showIf` n'apparaît jamais dans le prompt, même s'il garde une valeur.
