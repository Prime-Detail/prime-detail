#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMG_DIR="$ROOT_DIR/assets/images/avant-apres"

if [[ ! -d "$IMG_DIR" ]]; then
  echo "Directory not found: $IMG_DIR"
  exit 1
fi

encoder=""
if command -v cwebp >/dev/null 2>&1; then
  encoder="cwebp"
elif command -v ffmpeg >/dev/null 2>&1; then
  encoder="ffmpeg"
elif command -v magick >/dev/null 2>&1; then
  encoder="magick"
else
  echo "No supported encoder found (cwebp, ffmpeg, or magick)."
  exit 1
fi

echo "Using encoder: $encoder"

count_total=0
count_done=0

while IFS= read -r -d '' src; do
  base="${src%.*}"
  dst="${base}.webp"

  count_total=$((count_total + 1))

  if [[ -f "$dst" && "$dst" -nt "$src" ]]; then
    echo "Skip up-to-date: $(basename "$dst")"
    continue
  fi

  case "$encoder" in
    cwebp)
      cwebp -quiet -q 80 "$src" -o "$dst"
      ;;
    ffmpeg)
      ffmpeg -y -loglevel error -i "$src" -c:v libwebp -quality 80 -compression_level 6 "$dst"
      ;;
    magick)
      magick "$src" -quality 80 "$dst"
      ;;
  esac

  echo "Generated: $(basename "$dst")"
  count_done=$((count_done + 1))
done < <(find "$IMG_DIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

echo "Done: $count_done/$count_total files converted or refreshed."
