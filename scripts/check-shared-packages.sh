#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"

required_files=(
  "packages/data-provider/dist/index.js"
  "packages/data-schemas/dist/index.cjs"
  "packages/api/dist/index.js"
  "packages/client/dist/index.js"
)

missing=()
for file in "${required_files[@]}"; do
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    missing+=("$file")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing built package artifacts:" >&2
  for file in "${missing[@]}"; do
    echo "  - $file" >&2
  done
  exit 1
fi
