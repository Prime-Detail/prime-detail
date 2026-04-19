# Search Console Submission Kit 2026 - Prime Detail

## 1) Prerequis
- Le site est deploye et accessible publiquement.
- Les fichiers suivants repondent correctement:
  - `/robots.txt`
  - `/sitemap-index.xml`
  - `/sitemap.xml`
  - `/sitemap-media.xml`

## 2) URL de soumission
- Sitemap index principal:
  - `https://prime-detail.github.io/prime-detail/sitemap-index.xml`
- Sitemaps detail:
  - `https://prime-detail.github.io/prime-detail/sitemap.xml`
  - `https://prime-detail.github.io/prime-detail/sitemap-media.xml`

## 3) Procedure Search Console (ordre recommande)
1. Ouvrir Google Search Console.
2. Selectionner la propriete du site.
3. Aller dans `Indexation` > `Sitemaps`.
4. Soumettre d abord `sitemap-index.xml`.
5. Verifier que le statut passe a `Succes`.
6. Soumettre ensuite (optionnel) `sitemap.xml` et `sitemap-media.xml` pour debug fin.

## 4) Controle immediat (J0)
- Robots et sitemaps sont accessibles sans erreur HTTP.
- Dans Search Console:
  - `Sitemap lu` = oui
  - `Decouvertes URL` > 0
- Aucune URL critique en `Noindex` non voulue.

## 5) Controle J+7
- Ouvrir `Pages` dans Search Console.
- Verifier:
  - progression des URL `Indexees`
  - absence de hausse anormale des exclusions
- Ouvrir `Resultats de recherche`:
  - comparer clics/impressions J-7 vs J0
  - relever les pages locales en hausse/baisse

## 6) Controle J+30
- Comparer 30 jours vs 30 jours precedents:
  - Clics SEO
  - Impressions
  - CTR
  - Position moyenne
- Identifier 5 requetes a fort potentiel:
  - impressions elevees
  - CTR faible
- Lancer un lot d optimisation title/meta sur ces pages.

## 7) Actions correctives si probleme
- `Sitemap non lu`:
  - verifier format XML
  - verifier robots.txt
  - re-soumettre apres correction
- `URL decouverte mais non indexee`:
  - renforcer maillage interne
  - enrichir contenu unique
  - demander indexation des pages prioritaires
- `Doublon sans canonique`:
  - verifier balise canonical
  - verifier coherence des URL internes

## 8) Routine mensuelle (ultra court)
- Semaine 1: diagnostic Search Console
- Semaine 2: optimisation title/meta + maillage
- Semaine 3: nouveau contenu local
- Semaine 4: netlinking/citations locales

Voir aussi:
- `tools/SEO_MONTHLY_PLAYBOOK_2026.md`
