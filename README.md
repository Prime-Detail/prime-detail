# primedetail
Site web de Prime Detail — Nettoyage automobile premium à domicile à Caen. Présente les services, les tarifs, et permet de réserver en ligne.

## Migration Astro (dossier isolé)

Une base de migration est disponible dans [astro/README.md](astro/README.md).

Résumé rapide:

```bash
cd astro
npm install
npm run dev
```

### Déploiement GitHub Pages (Astro)
- Le workflow CI publie automatiquement Astro à chaque push sur `main`.
- Workflow: `.github/workflows/deploy-astro-pages.yml`.
- Source build: `astro/` puis publication de `astro/dist`.

## Assets & Logos

Les images sont organisées dans `assets/images/...`. Utilisez des formats optimisés (WebP/PNG) et des dimensions adaptées.

### Ajouter le logo et générer variantes
- Placez votre fichier source dans `assets/images/logo/logo.png`.
- Générez automatiquement les variantes et favicons avec le script:

```bash
./tools/generate-logo-assets.sh assets/images/logo/logo.png
```

- Commitez et poussez:

```bash
git add assets/images/logo/*.png assets/images/logo/*.webp assets/images/logo/*.svg
git commit -m "Add: variantes logo et favicons"
git push origin main
```

Le site référence le logo avec un chemin absolu GitHub Pages et un fallback local; un cache-busting `?v=3` est utilisé pour éviter les caches agressifs.

### Tester rapidement le logo en ligne
Utilisez le script simple ci-dessous pour vérifier la disponibilité du logo via GitHub Pages:

```bash
./tools/test-logo.sh 3
```

Le script tente une requête HEAD (`curl -I`) et ouvre l’URL si `$BROWSER` est défini.

### Générer des vidéos mobiles ultra-compatibles
Pour améliorer la lecture vidéo sur Android/iPhone (anciens appareils inclus), générez des versions H.264 Baseline:

```bash
chmod +x ./tools/transcode-mobile-video.sh
./tools/transcode-mobile-video.sh
```

Le script crée:
- `assets/videos/video-mobile.mp4` (qualité standard mobile)
- `assets/videos/video-mobile-lite.mp4` (version légère pour réseau lent)

Si le fichier MOV source est vide, le script bascule automatiquement sur `assets/images/gallery/video.mp4`.

Le site privilégie automatiquement la version légère si l’appareil indique un débit faible / mode économie de données.

### Lancer un audit Lighthouse mobile
Lancez un serveur local à la racine du projet, puis exécutez le script:

```bash
python3 -m http.server 4173
```

Dans un autre terminal:

```bash
./tools/run-lighthouse-mobile.sh
```

Vous obtiendrez:
- `tools/lighthouse-mobile.report.html`
- `tools/lighthouse-mobile.report.json`

Vous pouvez aussi passer une URL en argument:

```bash
./tools/run-lighthouse-mobile.sh "http://127.0.0.1:4173/index.html"
```

Si `BROWSER` est défini, le rapport HTML s’ouvre automatiquement à la fin.

### Audit Lighthouse en une seule commande
Ce script démarre un serveur local temporaire, lance Lighthouse mobile, puis coupe le serveur automatiquement:

```bash
./tools/run-lighthouse-mobile-once.sh
```

Si `BROWSER` est défini, le rapport HTML s’ouvre automatiquement à la fin.

### Vérification avant `git push`
Pour éviter les erreurs de push (ex: `RPC failed; HTTP 408`) dues à des fichiers trop lourds:

```bash
bash ./tools/pre-push-check.sh
```

Optionnel: définir un seuil personnalisé en MB (par défaut: `50`):

```bash
bash ./tools/pre-push-check.sh 25
```
