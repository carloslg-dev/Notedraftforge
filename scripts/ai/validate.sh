#!/usr/bin/env bash
# validate.sh — Run during the VALIDATE phase.
# Validates code: runs lint and tests if the Angular project exists.
# Does not depend on .ai/current-task.md — safe to run in CI without local state.
# Exits cleanly with a warning if no Angular project is detected yet.
set -euo pipefail

LABEL="[validate]"
FAILED=0

# --- Detect Angular project ---
HAS_ANGULAR=0
if [ -f "package.json" ] && grep -q '"@angular/core"' package.json 2>/dev/null; then
  HAS_ANGULAR=1
fi

if [ "$HAS_ANGULAR" -eq 0 ]; then
  echo "$LABEL WARN: No Angular project detected. Skipping code validation."
  echo "$LABEL       When the project is initialized, this script will run:"
  echo "$LABEL         ng lint"
  echo "$LABEL         ng test --watch=false"
  echo "$LABEL No code to validate. All checks passed."
  exit 0
fi

# --- Resolve Angular CLI ---
NG=""
if command -v ng &>/dev/null; then
  NG="ng"
elif [ -f "./node_modules/.bin/ng" ]; then
  NG="./node_modules/.bin/ng"
else
  echo "$LABEL ERROR: Angular CLI not found. Run 'npm install' first." >&2
  exit 1
fi

# --- Lint ---
echo "$LABEL Running lint..."
if ! $NG lint; then
  echo "$LABEL ERROR: Lint failed." >&2
  FAILED=1
fi

# --- Tests ---
echo "$LABEL Running tests..."
if ! $NG test --watch=false; then
  echo "$LABEL ERROR: Tests failed." >&2
  FAILED=1
fi

# --- Result ---
if [ "$FAILED" -eq 1 ]; then
  echo "$LABEL Validation FAILED." >&2
  exit 1
fi

echo "$LABEL Validation PASSED."
echo "$LABEL Remember to update 'Validation result' to PASS in .ai/current-task.md"
exit 0
