# GA4 Dashboard - Quick Form Tarifs

Objectif: suivre la performance du mini formulaire de la section tarifs et comparer les variantes A/B.

## Events utilises

- `tarif_quick_form_variant_assigned`
- `tarif_quick_form_continue_clicked`
- `tarif_quick_form_modal_opened`
- `tarif_quick_form_whatsapp_clicked`
- `tarif_quick_form_contact_clicked`
- `polish_diagnostic_cta_clicked`

## Parametres utiles

- `quick_form_variant` (A/B)
- `prestation_type`
- `cta_variant`
- `polish_level`

## 1) Creer les dimensions personnalisees

GA4 > Admin > Custom definitions > Create custom dimension:

1. Nom: `Quick Form Variant`
2. Scope: `Event`
3. Event parameter: `quick_form_variant`

(Optionnel) Ajouter aussi:

- `Prestation Type` -> `prestation_type`
- `CTA Variant` -> `cta_variant`
- `Polish Level` -> `polish_level`

## 2) Marquer les events importants

GA4 > Admin > Events:

- verifier que les events ci-dessus remontent
- marquer en Key event (conversion) au moins:
  - `tarif_quick_form_whatsapp_clicked`
  - `tarif_quick_form_contact_clicked`
  - `polish_diagnostic_cta_clicked`

## 3) Exploration recommandee (Funnel)

GA4 > Explore > Funnel exploration

Etapes du funnel:

1. `tarif_quick_form_continue_clicked`
2. `tarif_quick_form_modal_opened`
3. `tarif_quick_form_whatsapp_clicked` OU `tarif_quick_form_contact_clicked`

Breakdown:

- `Quick Form Variant`

Periode:

- 7 jours minimum (ou jusqu'a 100+ ouvertures modal)

## 4) Ratios a suivre

- `Modal Open Rate` = `modal_opened / continue_clicked`
- `WhatsApp Rate` = `whatsapp_clicked / modal_opened`
- `Form Continue Rate` = `contact_clicked / modal_opened`
- `Polish Diagnostic Rate` = `polish_diagnostic_cta_clicked / quiz_estimate_viewed` (filtre polish uniquement)

Lecture business:

- Si variant B augmente WhatsApp Rate sans faire baisser Form Continue Rate, conserver B.
- Si un variant ouvre plus la modal mais convertit moins, retravailler le texte de modal.

## 5) Validation rapide (DebugView)

1. Ouvrir le site avec `?ga_test=1&ga_debug=1`
2. Faire le quiz jusqu'au resultat
3. Soumettre le mini formulaire tarifs
4. Verifier dans DebugView:
   - `tarif_quick_form_continue_clicked`
   - `tarif_quick_form_modal_opened`
   - clic WhatsApp ou bouton formulaire complet

## 6) Regle de decision A/B

- Echantillon minimum: 100 `tarif_quick_form_modal_opened` par variante
- Seuil simple: +10% sur un KPI principal
- Priorite KPI:
  1. `tarif_quick_form_whatsapp_clicked / modal_opened`
  2. `tarif_quick_form_contact_clicked / modal_opened`

Si egalite, garder la variante la plus stable sur 14 jours.
