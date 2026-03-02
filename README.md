# primedetail
Site web de Prime Detail — Nettoyage automobile premium à domicile à Caen. Présente les services, les tarifs, et permet de réserver en ligne.

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

Le site privilégie automatiquement la version légère si l’appareil indique un débit faible / mode économie de données.

### Lancer un audit Lighthouse mobile
Lancez un serveur local à la racine du projet, puis exécutez le script:

```bash
python3 -m http.server 4173
```

Dans un autre terminal:

```bash
bash ./tools/run-lighthouse-mobile.sh
```

Vous obtiendrez:
- `tools/lighthouse-mobile.html`
- `tools/lighthouse-mobile.json`

Vous pouvez aussi passer une URL en argument:

```bash
bash ./tools/run-lighthouse-mobile.sh "http://127.0.0.1:4173/index.html"
```

### Audit Lighthouse en une seule commande
Ce script démarre un serveur local temporaire, lance Lighthouse mobile, puis coupe le serveur automatiquement:

```bash
bash ./tools/run-lighthouse-mobile-once.sh
```
