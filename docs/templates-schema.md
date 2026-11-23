# Templates de prompts — schéma des données

Tout le contenu des prompts vit dans `app/data/prompts/`. Le moteur `app/utils/prompt-builder.js` transforme une définition de template et les valeurs du formulaire en prompt final.

```
app/
├── data/prompts/
│   ├── index.js              ← DOMAINS, getDomain(), getTemplate(), getTemplateBySlug()
│   ├── common.js             ← listes partagées (secteurs, postures, formats…) + champs des étapes communes
│   ├── blocks.js             ← textes fixes du prompt (titres de sections, règles sources, aperçu…)
│   └── gestion-projet/
│       ├── index.js          ← le domaine : libellés, slugs, rôles, templates
│       ├── roles.js          ← bibliothèque de rôles du domaine
│       └── gp-0X-….js        ← un fichier par template
└── utils/prompt-builder.js   ← moteur (auto-importé par Nuxt)
scripts/test-prompts.mjs      ← tests sans Nuxt : `npm run test:prompts`
```

## Conventions

- **Traductions :** tout texte est un objet `{ fr, en }`. `localize(obj, locale)` choisit la langue.
- **Options :** `{ value, label, hint?, prompt? }`. `label` = affiché dans l'UI, `prompt` = texte injecté dans le prompt (sinon le label).
- **Interpolation :** `{{CLÉ}}` dans un texte du prompt est remplacé par la valeur rendue du champ `CLÉ` (option traduite, date au format local, liste jointe par des virgules).
- **Fragments conditionnels :** `{ fr, en, when: values => booléen }`. Un fragment sans `when` est toujours inclus.
- **Visibilité des champs :** `showIf(values)` pour un champ, `showIf(item, values)` pour un sous-champ de répéteur. Un champ masqué n'est ni affiché ni validé.

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
| `repeater` | blocs répétables | `itemFields`, `min`, `max`, `addLabel` |
| `table` | tableau éditable | idem répéteur ; `auto: 'letter'` = ID auto, `optionsFrom: 'rows.id'` = choix parmi les IDs des autres lignes, `import` = import CSV possible |
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
  defaults: { MODE, FORMAT, INFOS, PREVIEW, CITATIONS, AUDACE? },
  response: { audace: bool, public: bool | 'required', longueur: bool, tons: ['neutre', …] | null },

  fields: [ … ],                         // étape « Votre contexte »

  prompt: {
    roleFocus: { fr, en },               // ajouté après la phrase d'identité du rôle
    context: [fragments],
    data: [{ tag: { fr, en }, items: [{ key, label } | { key, render: (value, values, locale) => string }] }],
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

1. Créer `app/data/prompts/<domaine>/<id>-<nom>.js` en suivant le schéma ci-dessus.
2. L'ajouter au tableau `templates` du `index.js` du domaine (et ses rôles à `roles.js` si besoin).
3. Ajouter un cas d'exemple dans `scripts/test-prompts.mjs`, puis `npm run test:prompts`.
