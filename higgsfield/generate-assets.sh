#!/usr/bin/env bash
# ============================================================
# Boca Center for Healthy Living — Higgsfield asset pipeline
# Generates every asset declared in asset-manifest.json and
# places results in public/assets/higgsfield/<id>.<ext>
#
# Usage:   ./higgsfield/generate-assets.sh [asset-id ...]
#          (no args = generate everything missing)
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$SCRIPT_DIR/asset-manifest.json"
OUT_DIR="$ROOT_DIR/public/assets/higgsfield"

command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required." >&2; exit 1; }
command -v higgsfield >/dev/null 2>&1 || { echo "ERROR: higgsfield CLI not found on PATH." >&2; exit 1; }

# ---- Auth pre-check ----------------------------------------------------
if ! higgsfield account status >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: Higgsfield authentication failed.

The CLI could not reach or authenticate with the Higgsfield API.
Likely causes:
  1. This environment's network allowlist does not include the
     Higgsfield API domains. Ask your administrator to allowlist
     api.higgsfield.ai (and any CDN download hosts) for outbound HTTPS.
  2. You are not logged in. Run:  higgsfield auth login
  3. Your API key/session has expired.

Re-run this script once `higgsfield account status` succeeds.
The site builds and runs without these assets — every CinematicMedia
slot renders a premium procedural ambient layer until files arrive.
EOF
  exit 1
fi

mkdir -p "$OUT_DIR"

FILTER_IDS=("$@")

want() {
  local id="$1"
  [ ${#FILTER_IDS[@]} -eq 0 ] && return 0
  for f in "${FILTER_IDS[@]}"; do [ "$f" = "$id" ] && return 0; done
  return 1
}

COUNT=$(jq 'length' "$MANIFEST")
echo "Manifest contains $COUNT assets."

FAILED=()

for i in $(seq 0 $((COUNT - 1))); do
  ID=$(jq -r ".[$i].id" "$MANIFEST")
  want "$ID" || continue

  TYPE=$(jq -r ".[$i].type" "$MANIFEST")
  FILE=$(jq -r ".[$i].file" "$MANIFEST")
  CMD=$(jq -r ".[$i].command" "$MANIFEST")
  EXT="${FILE##*.}"
  DEST="$OUT_DIR/$ID.$EXT"

  if [ -s "$DEST" ]; then
    echo "[skip] $ID — already exists ($DEST)"
    continue
  fi

  echo "[gen ] $ID ($TYPE) ..."
  # The CLI (with --wait) prints the result URL or downloaded file path
  # on its final line; capture it and normalize into our public dir.
  if OUTPUT=$(eval "$CMD" 2>&1); then
    RESULT=$(printf '%s\n' "$OUTPUT" | grep -Eo '(https?://[^ ]+|/[^ ]+\.(mp4|png|jpg|jpeg|webp))' | tail -n1 || true)
    if [ -z "$RESULT" ]; then
      echo "[warn] $ID — could not locate result in CLI output:" >&2
      printf '%s\n' "$OUTPUT" >&2
      FAILED+=("$ID")
      continue
    fi
    case "$RESULT" in
      http*) curl -fsSL "$RESULT" -o "$DEST" ;;
      *)     cp "$RESULT" "$DEST" ;;
    esac
    echo "[ ok ] $ID -> $DEST"
  else
    echo "[fail] $ID — generation command failed:" >&2
    printf '%s\n' "$OUTPUT" >&2
    FAILED+=("$ID")
  fi
done

echo
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Completed with failures: ${FAILED[*]}" >&2
  exit 1
fi
echo "All requested assets are in $OUT_DIR"
