# Looker Studio - Version Ultra Courte (10 etapes)

1. Ouvrir Looker Studio > `Create` > `Report` > connecter la source GA4 Prime Detail.
2. Mettre la page en mobile: `Theme and layout` > largeur `390`, hauteur `2200`.
3. Ajouter un controle date en haut (par defaut `Last 7 days`).
4. Ajouter un filtre `device category` et choisir `mobile`.
5. Creer les champs `is_continue`, `is_modal_open`, `is_whatsapp`, `is_form_continue` (CASE sur `event_name`).
6. Creer les ratios `Modal Open Rate`, `WhatsApp Rate`, `Form Continue Rate`.
7. Ajouter 3 scorecards: `WhatsApp Rate`, `Modal Open Rate`, `Form Continue Rate`.
8. Ajouter une courbe 7 jours avec `SUM(is_modal_open)`, `SUM(is_whatsapp)`, `SUM(is_form_continue)`.
9. Ajouter un tableau A/B: dimension `quick_form_variant`, metriques `SUM(is_modal_open)`, `WhatsApp Rate`, `Form Continue Rate`.
10. Verifier dans GA4 DebugView avec `?ga_test=1&ga_debug=1`, puis relire le dashboard chaque jour en 20 secondes.

## Seuils express

- Alerte si `Modal Open Rate < 80%`
- Alerte si `WhatsApp Rate < 35%`
- Alerte si `Form Continue Rate < 20%`
