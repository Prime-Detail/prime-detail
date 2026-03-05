# Looker Studio Mini Dashboard - Mobile First

Objectif: lire la performance du funnel quick form sur smartphone en moins de 20 secondes.

## Format

- Canvas portrait (mobile)
- 1 page unique
- blocs verticaux (scroll court)
- max 5 composants visibles sans surcharge

## Bloc 1 - KPI essentiels (3 cards)

1. `WhatsApp Rate`
- `SUM(is_whatsapp) / SUM(is_modal_open)`
- KPI principal

2. `Modal Open Rate`
- `SUM(is_modal_open) / SUM(is_continue)`

3. `Form Continue Rate`
- `SUM(is_form_continue) / SUM(is_modal_open)`

Affichage recommande:

- decimal: pourcentage 1 decimale
- comparaison: vs periode precedente

## Bloc 2 - Micro tendance (7 jours)

- Graphique ligne unique avec 3 series:
  - `Modal Opened`
  - `WhatsApp Clicks`
  - `Form Continue Clicks`
- Legende courte
- Date range par defaut: `Last 7 days`

## Bloc 3 - A/B compact

Table compacte:

- Dimension: `quick_form_variant`
- Metrics:
  - `Modal Opened`
  - `WhatsApp Rate`
  - `Form Continue Rate`

Tri:

- `Modal Opened` desc

## Bloc 4 - Alertes

Scorecard texte (ou mini tableau) avec seuils:

- Alerte 1: `Modal Open Rate < 80%`
- Alerte 2: `WhatsApp Rate < 35%`
- Alerte 3: `Form Continue Rate < 20%`

## Filtres (minimum)

- Date range
- Device category (preselection mobile)

Optionnel:

- Source / medium

## Champs calcules necessaires

1. `is_continue`
- `CASE WHEN event_name = "tarif_quick_form_continue_clicked" THEN 1 ELSE 0 END`

2. `is_modal_open`
- `CASE WHEN event_name = "tarif_quick_form_modal_opened" THEN 1 ELSE 0 END`

3. `is_whatsapp`
- `CASE WHEN event_name = "tarif_quick_form_whatsapp_clicked" THEN 1 ELSE 0 END`

4. `is_form_continue`
- `CASE WHEN event_name = "tarif_quick_form_contact_clicked" THEN 1 ELSE 0 END`

5. `WhatsApp Rate`
- `SUM(is_whatsapp) / SUM(is_modal_open)`

6. `Modal Open Rate`
- `SUM(is_modal_open) / SUM(is_continue)`

7. `Form Continue Rate`
- `SUM(is_form_continue) / SUM(is_modal_open)`

## Routine rapide (mobile)

1. Lire les 3 KPI
2. Verifier si un seuil est rouge
3. Comparer A vs B sur `WhatsApp Rate`
4. Si baisse: verifier dernier changement de texte/CTA
