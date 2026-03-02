# Migration Astro (étape 1)

Ce dossier contient un scaffold Astro **isolé**:
- homepage `index` migrée en composants Astro natifs (`src/components/*`)
- page `mentions-legales` encore en reprise legacy (étape suivante)

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

Migrer `mentions-legales` en version Astro native,
puis remplacer le script inline global par des modules ciblés (quiz + contact + média) pour réduire le JS embarqué.
