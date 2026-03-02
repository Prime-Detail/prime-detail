#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
URL="${1:-http://127.0.0.1:4173/index.html}"
OUT_BASE="$ROOT_DIR/tools/lighthouse-mobile"
OUT_REPORT_BASE="${OUT_BASE}.report"
BROWSERS_DIR="$ROOT_DIR/.cache/ms-playwright"

if ! command -v npx >/dev/null 2>&1; then
  echo "Erreur: npx introuvable. Installe Node.js 18+ puis réessaie."
  exit 1
fi

detect_chrome_path() {
  if command -v google-chrome >/dev/null 2>&1; then
    command -v google-chrome
    return 0
  fi
  if command -v chromium >/dev/null 2>&1; then
    command -v chromium
    return 0
  fi
  if command -v chromium-browser >/dev/null 2>&1; then
    command -v chromium-browser
    return 0
  fi

  local pw_chrome
  pw_chrome="$(find "$BROWSERS_DIR" /home/codespace/.cache/ms-playwright -path '*/chrome-*/chrome' -type f 2>/dev/null | sort | tail -n 1 || true)"
  if [[ -n "$pw_chrome" ]]; then
    echo "$pw_chrome"
    return 0
  fi

  return 1
}

CHROME_PATH="$(detect_chrome_path || true)"
if [[ -z "$CHROME_PATH" ]]; then
  echo "Chromium/Chrome non détecté, installation Playwright Chromium..."
  PLAYWRIGHT_BROWSERS_PATH="$BROWSERS_DIR" npx --yes playwright@latest install chromium
  CHROME_PATH="$(detect_chrome_path || true)"
fi

if [[ -z "$CHROME_PATH" ]]; then
  echo "Erreur: impossible de trouver Chromium après installation."
  exit 1
fi

export CHROME_PATH

echo "Audit Lighthouse mobile sur: $URL"

echo "Sorties:"
echo "- ${OUT_REPORT_BASE}.html"
echo "- ${OUT_REPORT_BASE}.json"

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
  REPORT_URL="file://${OUT_REPORT_BASE}.html"
  echo "Ouverture du rapport: ${REPORT_URL}"
  "$BROWSER" "$REPORT_URL" >/dev/null 2>&1 || true
else
  echo "Info: variable BROWSER non définie, ouverture auto ignorée."
fi
