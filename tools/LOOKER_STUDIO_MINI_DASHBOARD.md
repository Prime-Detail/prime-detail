# Looker Studio Mini Dashboard - Pilotage Quotidien

Objectif: verifier en 30 secondes si le funnel mini formulaire tarifs performe bien.

## Layout (1 page)

## Ligne 1 - KPI cards

1. `Continue Clicks`
- Event: `tarif_quick_form_continue_clicked`

2. `Modal Opened`
- Event: `tarif_quick_form_modal_opened`

3. `WhatsApp Clicks`
- Event: `tarif_quick_form_whatsapp_clicked`

4. `Form Continue Clicks`
- Event: `tarif_quick_form_contact_clicked`

5. `Modal Open Rate`
- Formula: `Modal Opened / Continue Clicks`

6. `WhatsApp Rate`
- Formula: `WhatsApp Clicks / Modal Opened`

7. `Form Continue Rate`
- Formula: `Form Continue Clicks / Modal Opened`

## Ligne 2 - Tendance 7 jours

- Time series: `Modal Opened`, `WhatsApp Clicks`, `Form Continue Clicks`
- Granularite: jour
- Date range: `Last 7 days`

## Ligne 3 - A/B snapshot

Table:

- Dimension: `quick_form_variant`
- Metrics:
  - Continue Clicks
  - Modal Opened
  - WhatsApp Clicks
  - Form Continue Clicks
  - Modal Open Rate
  - WhatsApp Rate
  - Form Continue Rate

Tri:

- `Modal Opened` desc

## Filtres globaux

- Date range control
- Device category
- Source / medium

## Champs calcules (source Looker)

1. `is_continue`
- `CASE WHEN event_name = "tarif_quick_form_continue_clicked" THEN 1 ELSE 0 END`

2. `is_modal_open`
- `CASE WHEN event_name = "tarif_quick_form_modal_opened" THEN 1 ELSE 0 END`

3. `is_whatsapp`
- `CASE WHEN event_name = "tarif_quick_form_whatsapp_clicked" THEN 1 ELSE 0 END`

4. `is_form_continue`
- `CASE WHEN event_name = "tarif_quick_form_contact_clicked" THEN 1 ELSE 0 END`

5. `Modal Open Rate`
- `SUM(is_modal_open) / SUM(is_continue)`

6. `WhatsApp Rate`
- `SUM(is_whatsapp) / SUM(is_modal_open)`

7. `Form Continue Rate`
- `SUM(is_form_continue) / SUM(is_modal_open)`

## Seuils d'alerte simples

- `Modal Open Rate < 80%` -> verifier UX du mini formulaire
- `WhatsApp Rate < 35%` -> retravailler texte du bouton WhatsApp/modal
- `Form Continue Rate < 20%` -> verifier clarte CTA formulaire complet

## Routine quotidienne (30 sec)

1. Verifier la tendance 7 jours (hausse/baisse anormale)
2. Comparer A vs B sur `WhatsApp Rate`
3. Verifier qu'aucun ratio ne chute sous les seuils d'alerte
