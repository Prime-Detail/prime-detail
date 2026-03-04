#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="assets/images/avant-apres"
MODE="${1:-dry-run}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Directory not found: $TARGET_DIR"
  exit 1
fi

mapfile -d '' files < <(find "$TARGET_DIR" -maxdepth 1 -type f -name '* copy.*' -print0 | sort -z)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No '* copy.*' files found in $TARGET_DIR"
  exit 0
fi

echo "Found ${#files[@]} duplicate copy file(s):"
for f in "${files[@]}"; do
  echo "- $f"
done

if [[ "$MODE" == "dry-run" ]]; then
  echo
  echo "Dry-run only. Nothing deleted."
  echo "Run: bash tools/cleanup-avant-apres-copies.sh apply"
  exit 0
fi

if [[ "$MODE" != "apply" ]]; then
  echo "Unknown mode: $MODE"
  echo "Usage: bash tools/cleanup-avant-apres-copies.sh [dry-run|apply]"
  exit 1
fi

for f in "${files[@]}"; do
  rm -f "$f"
  echo "Deleted: $f"
done

echo "Cleanup complete."
