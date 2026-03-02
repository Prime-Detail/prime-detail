#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
URL="${1:-http://127.0.0.1:4173/index.html}"
OUT_BASE="$ROOT_DIR/tools/lighthouse-mobile"

if ! command -v npx >/dev/null 2>&1; then
  echo "Erreur: npx introuvable. Installe Node.js 18+ puis réessaie."
  exit 1
fi

echo "Audit Lighthouse mobile sur: $URL"

echo "Sorties:"
echo "- ${OUT_BASE}.html"
echo "- ${OUT_BASE}.json"

npx --yes lighthouse "$URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --emulated-form-factor=mobile \
  --screenEmulation.mobile \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
  --output=json \
  --output=html \
  --output-path="$OUT_BASE"

echo "Terminé ✅"

if [[ -n "${BROWSER:-}" ]]; then
  REPORT_URL="file://${OUT_BASE}.html"
  echo "Ouverture du rapport: ${REPORT_URL}"
  "$BROWSER" "$REPORT_URL" >/dev/null 2>&1 || true
else
  echo "Info: variable BROWSER non définie, ouverture auto ignorée."
fi
