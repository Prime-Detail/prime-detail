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

## 12) Seuils d'alerte recommandes (mini audit)

Objectif: eviter les fausses alertes tout en detectant vite une vraie regression.

### 12.1 Seuils de depart (site local service)

Utilise ces seuils au debut, puis ajuste avec tes 14 prochains jours de data.

- `Modal Open Rate` alerte si `< 75%`
- `WhatsApp Rate` alerte si `< 30%`
- `Form Continue Rate` alerte si `< 18%`

Seuils critiques (alerte rouge):

- `Modal Open Rate` `< 60%`
- `WhatsApp Rate` `< 20%`
- `Form Continue Rate` `< 12%`

### 12.2 Regle anti-bruit (tres important)

Ne declenche pas d'alerte si le volume est trop faible:

- Minimum journalier: `SUM(is_modal_open) >= 20`
- En dessous de 20, regarder la tendance 7 jours au lieu du jour J

### 12.3 Ajustement apres 14 jours

1. Prendre les 14 derniers jours mobile
2. Calculer mediane de chaque KPI
3. Nouveau seuil d'alerte = `mediane - 20%`
4. Nouveau seuil critique = `mediane - 35%`

Exemple rapide:

- Si mediane `WhatsApp Rate = 42%`
- Alerte: `33.6%` (arrondir `34%`)
- Critique: `27.3%` (arrondir `27%`)

### 12.4 Lecture actionnable

- Baisse `Modal Open Rate` seule: verifier copy/CTA quick form et bug d'ouverture modal
- Baisse `WhatsApp Rate` seule: verifier texte bouton WhatsApp, lien `wa.me`, promesse de reponse
- Baisse `Form Continue Rate` seule: verifier wording du bouton formulaire et friction du formulaire contact

## 13) Regles d'alerte copier-coller (Looker Studio)

Menu: `Resource` > `Manage added data sources` > `Edit` > `Add a field`

Creer ces champs:

1. Nom: `enough_volume`
- Formule:
`CASE WHEN SUM(is_modal_open) >= 20 THEN 1 ELSE 0 END`

2. Nom: `alert_modal_open`
- Formule:
`CASE WHEN enough_volume = 1 AND Modal Open Rate < 0.75 THEN 1 ELSE 0 END`

3. Nom: `alert_whatsapp`
- Formule:
`CASE WHEN enough_volume = 1 AND WhatsApp Rate < 0.30 THEN 1 ELSE 0 END`

4. Nom: `alert_form_continue`
- Formule:
`CASE WHEN enough_volume = 1 AND Form Continue Rate < 0.18 THEN 1 ELSE 0 END`

5. Nom: `critical_modal_open`
- Formule:
`CASE WHEN enough_volume = 1 AND Modal Open Rate < 0.60 THEN 1 ELSE 0 END`

6. Nom: `critical_whatsapp`
- Formule:
`CASE WHEN enough_volume = 1 AND WhatsApp Rate < 0.20 THEN 1 ELSE 0 END`

7. Nom: `critical_form_continue`
- Formule:
`CASE WHEN enough_volume = 1 AND Form Continue Rate < 0.12 THEN 1 ELSE 0 END`

8. Nom: `alert_status`
- Formule:
`CASE
  WHEN enough_volume = 0 THEN "Volume faible"
  WHEN critical_modal_open = 1 OR critical_whatsapp = 1 OR critical_form_continue = 1 THEN "Alerte critique"
  WHEN alert_modal_open = 1 OR alert_whatsapp = 1 OR alert_form_continue = 1 THEN "Alerte"
  ELSE "OK"
END`

9. Nom: `alert_details`
- Formule:
`CONCAT(
  "Modal:", IF(alert_modal_open = 1, "KO", "OK"),
  " | WhatsApp:", IF(alert_whatsapp = 1, "KO", "OK"),
  " | Form:", IF(alert_form_continue = 1, "KO", "OK")
)`

Mise en place visuelle rapide:

1. Ajouter une `Scorecard` sur `alert_status`
2. Ajouter une `Table` avec dimension `Date` et metriques:
- `alert_status`
- `alert_details`
- `SUM(is_modal_open)`
- `Modal Open Rate`
- `WhatsApp Rate`
- `Form Continue Rate`
3. Trier par `Date` desc
4. Ajouter un filtre `device category = mobile`

Option couleur (format conditionnel table):

- `alert_status = "Alerte critique"` -> rouge
- `alert_status = "Alerte"` -> orange
- `alert_status = "OK"` -> vert

## 14) Version auto-ajustee 14 jours (seuils dynamiques)

But: remplacer les seuils fixes par des seuils qui suivent ton niveau reel.

### 14.1 Creer 3 parametres (base mobile 14 jours)

Dans la source Looker: `Add a parameter`

1. `p_base_modal_open_rate`
- Type: Number
- Default: `0.80`

2. `p_base_whatsapp_rate`
- Type: Number
- Default: `0.40`

3. `p_base_form_continue_rate`
- Type: Number
- Default: `0.25`

Note:
- Mets ces valeurs selon ta mediane mobile des 14 derniers jours.
- Tu peux les mettre a jour 1 fois/semaine (30 secondes).

### 14.2 Champs derives (alerte et critique)

Ajouter ces champs:

1. `dyn_alert_modal_open_threshold`
- `p_base_modal_open_rate * 0.80`

2. `dyn_alert_whatsapp_threshold`
- `p_base_whatsapp_rate * 0.80`

3. `dyn_alert_form_continue_threshold`
- `p_base_form_continue_rate * 0.80`

4. `dyn_critical_modal_open_threshold`
- `p_base_modal_open_rate * 0.65`

5. `dyn_critical_whatsapp_threshold`
- `p_base_whatsapp_rate * 0.65`

6. `dyn_critical_form_continue_threshold`
- `p_base_form_continue_rate * 0.65`

7. `dyn_alert_modal_open`
- `CASE WHEN enough_volume = 1 AND Modal Open Rate < dyn_alert_modal_open_threshold THEN 1 ELSE 0 END`

8. `dyn_alert_whatsapp`
- `CASE WHEN enough_volume = 1 AND WhatsApp Rate < dyn_alert_whatsapp_threshold THEN 1 ELSE 0 END`

9. `dyn_alert_form_continue`
- `CASE WHEN enough_volume = 1 AND Form Continue Rate < dyn_alert_form_continue_threshold THEN 1 ELSE 0 END`

10. `dyn_critical_modal_open`
- `CASE WHEN enough_volume = 1 AND Modal Open Rate < dyn_critical_modal_open_threshold THEN 1 ELSE 0 END`

11. `dyn_critical_whatsapp`
- `CASE WHEN enough_volume = 1 AND WhatsApp Rate < dyn_critical_whatsapp_threshold THEN 1 ELSE 0 END`

12. `dyn_critical_form_continue`
- `CASE WHEN enough_volume = 1 AND Form Continue Rate < dyn_critical_form_continue_threshold THEN 1 ELSE 0 END`

13. `dyn_alert_status`
- `CASE
  WHEN enough_volume = 0 THEN "Volume faible"
  WHEN dyn_critical_modal_open = 1 OR dyn_critical_whatsapp = 1 OR dyn_critical_form_continue = 1 THEN "Alerte critique"
  WHEN dyn_alert_modal_open = 1 OR dyn_alert_whatsapp = 1 OR dyn_alert_form_continue = 1 THEN "Alerte"
  ELSE "OK"
END`

### 14.3 Routine hebdo (1 minute)

1. Filtrer `device category = mobile`
2. Prendre les KPI sur `Last 14 days`
3. Reporter les 3 valeurs dans les parametres `p_base_*`
4. Verifier la scorecard `dyn_alert_status`

Resultat:
- Le systeme suit ton niveau reel (saisonnalite, volume)
- Moins de faux positifs qu'avec des seuils fixes

## 15) KPI contacts combines (appels + messages)

Si ton objectif business est le contact total (pas seulement WhatsApp), ajoute ces champs.

1. Nom: `is_call`
- Formule:
`CASE WHEN event_name = "contact_call_clicked" THEN 1 ELSE 0 END`

2. Nom: `is_message`
- Formule:
`CASE WHEN event_name IN ("tarif_quick_form_whatsapp_clicked", "contact_whatsapp_clicked") THEN 1 ELSE 0 END`

3. Nom: `contacts_total`
- Formule:
`SUM(is_call) + SUM(is_message)`

4. Nom: `Contact Rate (Call+Msg)`
- Formule:
`(SUM(is_call) + SUM(is_message)) / SUM(is_modal_open)`
- Type: Percent

Lecture rapide:

- Si `Contact Rate (Call+Msg)` monte, ton funnel global progresse
- Si WhatsApp baisse mais `is_call` monte, ce n'est pas forcement une regression business
