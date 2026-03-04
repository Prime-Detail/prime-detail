#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="assets/images/avant-apres"
ARCHIVE_DIR="$TARGET_DIR/_non-web"
MODE="${1:-dry-run}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Directory not found: $TARGET_DIR"
  exit 1
fi

if [[ "$MODE" != "dry-run" && "$MODE" != "apply" ]]; then
  echo "Usage: bash tools/normalize-avant-apres-assets.sh [dry-run|apply]"
  exit 1
fi

declare -A RENAME_MAP=(
  ["Tableau de bord avant polo.jpg"]="tableau-de-bord-avant-polo.jpg"
  ["Tableau-de-bord-apres-polo.jpg"]="tableau-de-bord-apres-polo.jpg"
  ["apres 3008.jpeg"]="apres-3008.jpeg"
  ["apres zoe.jpeg"]="apres-zoe.jpeg"
  ["avant 3008.jpeg"]="avant-3008.jpeg"
  ["avant zoe.jpeg"]="avant-zoe.jpeg"
  ["c8 apres.jpeg"]="c8-apres.jpeg"
  ["c8 avant.jpeg"]="c8-avant.jpeg"
  ["cuir bmw.jpeg"]="cuir-bmw.jpeg"
  ["jantes porsche.jpeg"]="jantes-porsche.jpeg"
  ["tableau-de-bord polo-avant.jpg"]="tableau-de-bord-polo-avant.jpg"
  ["video jante bmw.mp4"]="video-jante-bmw.mp4"
  ["volant apres bmw.jpeg"]="volant-apres-bmw.jpeg"
  ["volant bmw.jpeg"]="volant-bmw.jpeg"
  ["siège-apres-polo.jpg"]="siege-apres-polo-2.jpg"
)

plan_move_heic() {
  local found=0
  shopt -s nullglob
  for f in "$TARGET_DIR"/*.HEIC "$TARGET_DIR"/*.heic; do
    found=1
    local base
    base="$(basename "$f")"
    local normalized
    normalized="$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+/-/g')"
    echo "MOVE_HEIC $base -> _non-web/$normalized"
  done
  shopt -u nullglob

  if [[ "$found" -eq 0 ]]; then
    echo "MOVE_HEIC none"
  fi
}

plan_renames() {
  for src in "${!RENAME_MAP[@]}"; do
    local src_path="$TARGET_DIR/$src"
    local dest_name="${RENAME_MAP[$src]}"
    local dest_path="$TARGET_DIR/$dest_name"

    if [[ ! -f "$src_path" ]]; then
      continue
    fi

    if [[ "$src" == "$dest_name" ]]; then
      continue
    fi

    if [[ -f "$dest_path" ]]; then
      echo "SKIP_EXISTS $src -> $dest_name"
    else
      echo "RENAME $src -> $dest_name"
    fi
  done
}

apply_move_heic() {
  mkdir -p "$ARCHIVE_DIR"
  shopt -s nullglob
  for f in "$TARGET_DIR"/*.HEIC "$TARGET_DIR"/*.heic; do
    local base
    base="$(basename "$f")"
    local normalized
    normalized="$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+/-/g')"
    local dest="$ARCHIVE_DIR/$normalized"

    if [[ -f "$dest" ]]; then
      echo "SKIP_EXISTS $(basename "$f") -> _non-web/$normalized"
      continue
    fi

    mv "$f" "$dest"
    echo "MOVED $(basename "$f") -> _non-web/$normalized"
  done
  shopt -u nullglob
}

apply_renames() {
  for src in "${!RENAME_MAP[@]}"; do
    local src_path="$TARGET_DIR/$src"
    local dest_name="${RENAME_MAP[$src]}"
    local dest_path="$TARGET_DIR/$dest_name"

    if [[ ! -f "$src_path" ]]; then
      continue
    fi

    if [[ "$src" == "$dest_name" ]]; then
      continue
    fi

    if [[ -f "$dest_path" ]]; then
      echo "SKIP_EXISTS $src -> $dest_name"
      continue
    fi

    mv "$src_path" "$dest_path"
    echo "RENAMED $src -> $dest_name"
  done
}

echo "== Planned HEIC archive moves =="
plan_move_heic

echo
echo "== Planned filename normalizations =="
plan_renames

if [[ "$MODE" == "dry-run" ]]; then
  echo
  echo "Dry-run complete."
  echo "Run: bash tools/normalize-avant-apres-assets.sh apply"
  exit 0
fi

echo
echo "== Applying changes =="
apply_move_heic
apply_renames

echo "Done."
