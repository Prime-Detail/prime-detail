# Looker Studio Blueprint - Quick Form Tarifs

Objectif: construire un dashboard Looker Studio connecte a GA4 pour piloter le mini formulaire tarifs et les variantes A/B.

## Source de donnees

- Connecteur: `Google Analytics`
- Property: Prime Detail (GA4)
- Date range par defaut: `Last 28 days`

Prerequis GA4:

- Event parameter dispo: `quick_form_variant`
- Si absent dans Looker: creer la custom dimension dans GA4 puis attendre la propagation.

## Structure du dashboard

## Page 1 - Vue executive

Indicateurs (scorecards):

- `Continue Clicks`: Count de `tarif_quick_form_continue_clicked`
- `Modal Opened`: Count de `tarif_quick_form_modal_opened`
- `WhatsApp Clicks`: Count de `tarif_quick_form_whatsapp_clicked`
- `Form Continue Clicks`: Count de `tarif_quick_form_contact_clicked`

Ratios (scorecards calcules):

- `Modal Open Rate` = `Modal Opened / Continue Clicks`
- `WhatsApp Rate` = `WhatsApp Clicks / Modal Opened`
- `Form Continue Rate` = `Form Continue Clicks / Modal Opened`

Series temporelles:

- Courbe 1: `Modal Opened` par jour
- Courbe 2: `WhatsApp Clicks` par jour
- Courbe 3: `Form Continue Clicks` par jour

## Page 2 - A/B Test

Table principale:

Dimensions:

- `quick_form_variant`

Metriques:

- Continue Clicks
- Modal Opened
- WhatsApp Clicks
- Form Continue Clicks
- Modal Open Rate
- WhatsApp Rate
- Form Continue Rate

Graphique barres:

- Dimension: `quick_form_variant`
- Metrique: `WhatsApp Rate`

Graphique barres 2:

- Dimension: `quick_form_variant`
- Metrique: `Form Continue Rate`

## Page 3 - Qualite du lead et coherence

Scorecards:

- `lead_coherence_issue_detected`
- `lead_coherence_fixed`
- `Coherence Fix Rate` = `lead_coherence_fixed / lead_coherence_issue_detected`

Table:

Dimensions:

- `prestation_type`
- `quick_form_variant`

Metriques:

- lead_coherence_issue_detected
- lead_coherence_fixed
- Coherence Fix Rate

Bloc supplementaire (polissage):

- Scorecard: `polish_diagnostic_cta_clicked`
- Breakdown: `polish_level`
- KPI: `Polish Diagnostic Rate` (filtre events polish)

## Champs calcules recommandes

Dans la source Looker Studio, creer:

1. `is_continue`
- Formula:
  - `CASE WHEN event_name = "tarif_quick_form_continue_clicked" THEN 1 ELSE 0 END`

2. `is_modal_open`
- Formula:
  - `CASE WHEN event_name = "tarif_quick_form_modal_opened" THEN 1 ELSE 0 END`

3. `is_whatsapp`
- Formula:
  - `CASE WHEN event_name = "tarif_quick_form_whatsapp_clicked" THEN 1 ELSE 0 END`

4. `is_form_continue`
- Formula:
  - `CASE WHEN event_name = "tarif_quick_form_contact_clicked" THEN 1 ELSE 0 END`

5. `is_coherence_issue`
- Formula:
  - `CASE WHEN event_name = "lead_coherence_issue_detected" THEN 1 ELSE 0 END`

6. `is_coherence_fixed`
- Formula:
  - `CASE WHEN event_name = "lead_coherence_fixed" THEN 1 ELSE 0 END`

  7. `is_polish_diagnostic`
  - Formula:
    - `CASE WHEN event_name = "polish_diagnostic_cta_clicked" THEN 1 ELSE 0 END`

Ratios (champs calcules):

- `Modal Open Rate` = `SUM(is_modal_open) / SUM(is_continue)`
- `WhatsApp Rate` = `SUM(is_whatsapp) / SUM(is_modal_open)`
- `Form Continue Rate` = `SUM(is_form_continue) / SUM(is_modal_open)`
- `Coherence Fix Rate` = `SUM(is_coherence_fixed) / SUM(is_coherence_issue)`
- `Polish Diagnostic Rate` = `SUM(is_polish_diagnostic) / SUM(is_modal_open)`

## Filtres de page

Filtres globaux:

- Date range
- Device category
- Source / medium
- quick_form_variant

Filtre events utiles (optionnel):

- Inclure seulement:
  - `tarif_quick_form_continue_clicked`
  - `tarif_quick_form_modal_opened`
  - `tarif_quick_form_whatsapp_clicked`
  - `tarif_quick_form_contact_clicked`
  - `lead_coherence_issue_detected`
  - `lead_coherence_fixed`
  - `polish_diagnostic_cta_clicked`

## Regle de decision A/B

- Echantillon minimum: 100 `modal_opened` par variante
- Horizon minimum: 7 jours (ideal 14)
- Critere principal: `WhatsApp Rate`
- Critere secondaire: `Form Continue Rate`
- Condition gagnante: +10% sur principal sans degradation secondaire

## Checklist de validation

1. Ouvrir site avec `?ga_test=1&ga_debug=1`
2. Faire un flux complet mini formulaire
3. Verifier DebugView pour events quick form
4. Attendre quelques minutes
5. Verifier que Looker affiche bien les nouveaux events

## Notes

- Les donnees GA4 peuvent avoir un leger delai selon les vues.
- Si `quick_form_variant` n'apparait pas, verifier la custom dimension GA4 puis patienter la propagation.
