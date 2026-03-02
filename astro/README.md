# Migration Astro (étape 1)

Ce dossier contient un scaffold Astro **isolé**:
- homepage `index` migrée en composants Astro natifs (`src/components/*`)
- page `mentions-legales` migrée en Astro natif
- JavaScript découpé en scripts ciblés (`public/scripts/*`)

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

Copier automatiquement les assets (`../assets`) dans `public/assets` pendant le build/dev,
puis mesurer les gains Lighthouse mobile avant/après.
