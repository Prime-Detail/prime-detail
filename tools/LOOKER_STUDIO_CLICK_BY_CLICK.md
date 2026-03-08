# Looker Studio - Guide Copier/Coller (Click-by-Click)

Objectif: construire rapidement un dashboard mobile de pilotage du quick form tarifs.

## 0) Avant de commencer

Dans GA4, verifier que le parametre existe:

- `quick_form_variant` (custom dimension, scope Event)

Events utilises:

- `tarif_quick_form_continue_clicked`
- `tarif_quick_form_modal_opened`
- `tarif_quick_form_whatsapp_clicked`
- `tarif_quick_form_contact_clicked`

## 1) Creer le rapport

1. Ouvrir Looker Studio
2. `Create` > `Report`
3. Choisir source `Google Analytics`
4. Selectionner ta property GA4 Prime Detail
5. `Add to report`

## 2) Ajouter les champs calcules (source)

Menu `Resource` > `Manage added data sources` > `Edit` > `Add a field`

Creer ces champs exactement:

1. Nom: `is_continue`
- Formule:
`CASE WHEN event_name = "tarif_quick_form_continue_clicked" THEN 1 ELSE 0 END`

2. Nom: `is_modal_open`
- Formule:
`CASE WHEN event_name = "tarif_quick_form_modal_opened" THEN 1 ELSE 0 END`

3. Nom: `is_whatsapp`
- Formule:
`CASE WHEN event_name = "tarif_quick_form_whatsapp_clicked" THEN 1 ELSE 0 END`

4. Nom: `is_form_continue`
- Formule:
`CASE WHEN event_name = "tarif_quick_form_contact_clicked" THEN 1 ELSE 0 END`

5. Nom: `Modal Open Rate`
- Formule:
`SUM(is_modal_open) / SUM(is_continue)`
- Type: Percent

6. Nom: `WhatsApp Rate`
- Formule:
`SUM(is_whatsapp) / SUM(is_modal_open)`
- Type: Percent

7. Nom: `Form Continue Rate`
- Formule:
`SUM(is_form_continue) / SUM(is_modal_open)`
- Type: Percent

## 3) Mettre le canvas en mobile

1. Cliquer fond de page
2. `Theme and layout` > `Layout`
3. Canvas `Custom`
4. Recommande: largeur 390, hauteur 2200

## 4) Ajouter filtres globaux

1. `Add a control` > `Date range control`
- Position: haut de page
- Default date range: `Last 7 days`

2. `Add a control` > `Drop-down list`
- Dimension: `device category`
- Default: `mobile`

## 5) Ajouter les KPI cards

Ajouter 3 `Scorecard`:

1. Metric: `WhatsApp Rate`
2. Metric: `Modal Open Rate`
3. Metric: `Form Continue Rate`

Reglages communs:

- Comparison date range: `Previous period`
- Decimal: 1
- Compact numbers: off

## 6) Ajouter la tendance 7 jours

1. `Add a chart` > `Time series`
2. Dimension: `Date`
3. Metrics:
- `SUM(is_modal_open)`
- `SUM(is_whatsapp)`
- `SUM(is_form_continue)`
4. Date range: inherit report (`Last 7 days`)

## 7) Ajouter tableau A/B compact

1. `Add a chart` > `Table`
2. Dimension: `quick_form_variant`
3. Metrics:
- `SUM(is_modal_open)`
- `WhatsApp Rate`
- `Form Continue Rate`
4. Sort: `SUM(is_modal_open)` desc

## 8) Ajouter bloc alertes (option simple)

Option rapide:

- Ajouter un `Text box` avec:
  - `Alerte si Modal Open Rate < 80%`
  - `Alerte si WhatsApp Rate < 35%`
  - `Alerte si Form Continue Rate < 20%`

## 9) Verifier les donnees

1. Ouvrir site avec `?ga_test=1&ga_debug=1`
2. Faire un flux quick form complet
3. Verifier GA4 DebugView
4. Revenir Looker et rafraichir

## 10) Lecture quotidienne (20 sec)

1. Lire les 3 KPI
2. Verifier tendance 7 jours
3. Comparer A/B sur `WhatsApp Rate`
4. Si chute > 10%, verifier dernier changement de copy

## 11) Checklist GA4 live (5 clics)

1. Ouvrir le site avec:
- `?ga_test=1&ga_debug=1`

2. Dans GA4:
- `Admin` > `DebugView`

3. Faire un flux quick form complet:
- Ouvrir le quiz
- Remplir le quick form
- Ouvrir la modal
- Cliquer WhatsApp ou Continuer vers formulaire

4. Verifier ces events dans DebugView:
- `tarif_quick_form_continue_clicked`
- `tarif_quick_form_modal_opened`
- `tarif_quick_form_whatsapp_clicked`
- `tarif_quick_form_contact_clicked`

5. Ouvrir un event et controler les parametres:
- `quick_form_variant` (doit etre `A` ou `B`)
- `prestation_type` present sur les events quick form
- `source = tarif_modal` pour les clics modal

Si rien ne remonte en DebugView:
- Verifier que tu es sur une page qui charge `quiz.js` (`index`)
- Verifier l'ID GA4 `G-FJBK0MCYPQ`
- Recharger sans bloqueur pub et retester
