# Migration Astro (étape 1)

Ce dossier contient un scaffold Astro **isolé** qui reprend automatiquement:
- `../index.html`
- `../mentions-legales.html`

## Lancer localement

```bash
cd astro
npm install
npm run dev
```

## Important (assets)

La reprise des pages utilise encore les chemins `/assets/...`.
Pour les servir dans Astro, copiez les assets dans `astro/public/assets`:

```bash
mkdir -p public
cp -R ../assets ./public/assets
```

## Objectif de l'étape suivante

Remplacer la reprise "legacy" par des composants Astro natifs section par section,
avec optimisation mobile-first (images responsive, JS minimal, SEO conservé).
