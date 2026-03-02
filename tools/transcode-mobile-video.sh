#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_MOV="$ROOT_DIR/assets/videos/Pub prime detail dacia Logan.MOV"
INPUT_MP4="$ROOT_DIR/assets/images/gallery/video.mp4"
OUTPUT_MP4="$ROOT_DIR/assets/videos/video-mobile.mp4"
OUTPUT_LITE_MP4="$ROOT_DIR/assets/videos/video-mobile-lite.mp4"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Erreur: ffmpeg n'est pas installé."
  echo "Installe ffmpeg puis relance ce script."
  exit 1
fi

if [[ -s "$INPUT_MOV" ]]; then
  INPUT_FILE="$INPUT_MOV"
elif [[ -s "$INPUT_MP4" ]]; then
  INPUT_FILE="$INPUT_MP4"
else
  echo "Erreur: aucun fichier source trouvé."
  echo "Attendu:"
  echo " - $INPUT_MOV"
  echo " - ou $INPUT_MP4"
  exit 1
fi

echo "Source: $INPUT_FILE"
echo "Sortie: $OUTPUT_MP4"
echo "Sortie lite: $OUTPUT_LITE_MP4"

ffmpeg -y \
  -i "$INPUT_FILE" \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -preset medium \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -ac 2 \
  "$OUTPUT_MP4"

ffmpeg -y \
  -i "$INPUT_FILE" \
  -vf "scale='min(854,iw)':-2" \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -preset medium \
  -crf 28 \
  -maxrate 900k \
  -bufsize 1800k \
  -c:a aac \
  -b:a 96k \
  -ac 2 \
  "$OUTPUT_LITE_MP4"

echo "Terminé: $OUTPUT_MP4"
echo "Terminé: $OUTPUT_LITE_MP4"
