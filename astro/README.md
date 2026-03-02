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
La copie `../assets` vers `astro/public/assets` est maintenant automatique via:
- `npm run predev`
- `npm run prebuild`

Commande manuelle si besoin:

```bash
npm run sync:assets
```

## Objectif de l'étape suivante

Mesurer les gains Lighthouse mobile avant/après,
puis finaliser le cutover de déploiement Astro.
