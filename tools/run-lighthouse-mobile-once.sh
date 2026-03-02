#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${LIGHTHOUSE_PORT:-4173}"
URL="${1:-http://127.0.0.1:${PORT}/index.html}"
OUT_BASE="$ROOT_DIR/tools/lighthouse-mobile"

if ! command -v npx >/dev/null 2>&1; then
  echo "Erreur: npx introuvable. Installe Node.js 18+ puis réessaie."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Erreur: python3 introuvable."
  exit 1
fi

SERVER_PID=""
cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "$ROOT_DIR"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID="$!"
sleep 1

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
