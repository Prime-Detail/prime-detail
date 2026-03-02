#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

LIMIT_MB="${1:-50}"
if ! [[ "$LIMIT_MB" =~ ^[0-9]+$ ]]; then
  echo "Usage: bash tools/pre-push-check.sh [taille_max_MB]"
  exit 2
fi

LIMIT_BYTES=$((LIMIT_MB * 1024 * 1024))
HAS_ERROR=0

echo "Vérification pre-push (seuil: ${LIMIT_MB} MB)"
echo

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erreur: ce dossier n'est pas un dépôt Git."
  exit 2
fi

echo "1) Fichiers suivis mais ignorés (.gitignore)"
TRACKED_IGNORED="$(git ls-files -ci --exclude-standard || true)"
if [[ -n "$TRACKED_IGNORED" ]]; then
  HAS_ERROR=1
  echo "⚠️  Des fichiers ignorés sont encore suivis:"
  echo "$TRACKED_IGNORED"
  echo "Action: git rm -r --cached <chemin>"
else
  echo "OK"
fi

echo
echo "2) Fichiers STAGÉS > ${LIMIT_MB} MB"
STAGED_FILES="$(git diff --cached --name-only --diff-filter=AM || true)"
BIG_STAGED=""
if [[ -n "$STAGED_FILES" ]]; then
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    if [[ -f "$file" ]]; then
      size=$(stat -c '%s' "$file")
      if (( size > LIMIT_BYTES )); then
        BIG_STAGED+="$(numfmt --to=iec --suffix=B "$size")  $file"$'\n'
      fi
    fi
  done <<< "$STAGED_FILES"
fi
if [[ -n "$BIG_STAGED" ]]; then
  HAS_ERROR=1
  echo "⚠️  Fichiers trop volumineux dans l'index:"
  printf "%s" "$BIG_STAGED"
  echo "Action: git reset HEAD <fichier> puis ajoutez une version plus légère."
else
  echo "OK"
fi

echo
echo "3) Plus gros fichiers suivis (top 10)"
python3 - <<'PY'
import pathlib, subprocess
root = pathlib.Path('.').resolve()
res = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, check=False)
rows = []
for rel in res.stdout.splitlines():
    p = root / rel
    if p.is_file():
        rows.append((p.stat().st_size, rel))
for size, rel in sorted(rows, reverse=True)[:10]:
    mb = size / (1024 * 1024)
    print(f"{mb:8.2f} MB  {rel}")
PY

echo
if (( HAS_ERROR )); then
  echo "Résultat: BLOQUANT ❌"
  echo "Corrigez les points ci-dessus avant git push."
  exit 1
fi

echo "Résultat: OK ✅"
