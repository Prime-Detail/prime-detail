# Assets - Prime Detail

## Structure des dossiers

### 📁 images/

Toutes les images du site

#### images/avant-apres/

Photos avant/après des prestations :

- Sièges avant
- Tableau de bord
- Banquettes arrière
- Coffre
- Moquettes
- Etc.

**Format recommandé** : JPG ou WebP, max 500Ko par image

#### images/services/

Photos illustrant les services :

- Nettoyage intérieur
- Polish extérieur
- Céramique
- Rénovation
- Etc.

**Format recommandé** : JPG ou WebP, max 300Ko par image

#### images/logo/

Logo Prime Detail en différents formats :

- logo.png (fond transparent)
- logo.svg (vectoriel)
- favicon.ico

### 📁 videos/

Vidéos de présentation et démonstrations

**Format recommandé** : MP4 (H.264), max 10Mo
**Résolution** : 1920x1080 ou 1280x720

## Utilisation dans le code

Une fois vos fichiers ajoutés, je pourrai les intégrer automatiquement dans le site en remplaçant les images Unsplash actuelles.

Exemple :

```html
<img src="assets/images/avant-apres/sieges-avant.jpg" alt="Sièges avant nettoyés">
```

## Logo – génération automatique

Un script est disponible pour générer des variantes optimisées du logo.

Prérequis (une fois) :

- ImageMagick (magick/convert)
- pngquant (optionnel)
- webp (cwebp) (optionnel)
- potrace (optionnel pour SVG)

Installation rapide (Ubuntu) :

```bash
sudo apt update
sudo apt install -y imagemagick pngquant webp potrace
```

Lancer la génération (à partir de votre logo source) :

```bash
bash tools/generate-logo-assets.sh assets/images/logo/logo.png
```

Sorties attendues dans `assets/images/logo/` :

- `prime-detail-logo.png` (600x200) et `prime-detail-logo@2x.png` (1200x400)
- versions `.webp` si disponibles
- favicons 64/32
- optionnel: `prime-detail-logo.svg`

Le header utilise automatiquement `picture` avec `srcset` pour Retina et WebP si présents.