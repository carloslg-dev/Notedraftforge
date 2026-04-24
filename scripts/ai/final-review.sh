#!/usr/bin/env bash
# final-review.sh — Run before closing a task (REVIEW phase).
# Quality gate: checks plan approval, validation result, and open blockers.
# Warns if retrospective notes are empty (does not block).
set -euo pipefail

LABEL="[final-review]"
TASK_FILE=".ai/current-task.md"
FAILED=0

# --- Task state must exist ---
if [ ! -f "$TASK_FILE" ]; then
  echo "$LABEL ERROR: $TASK_FILE not found." >&2
  exit 1
fi

# --- Plan must be approved ---
# Accepted patterns (case-insensitive):
#   - [x] Yes
#   Approved: yes
#   Plan approved: true
PLAN_APPROVED=0
if grep -qiE '^\s*-\s*\[x\]\s*Yes' "$TASK_FILE" 2>/dev/null; then
  PLAN_APPROVED=1
elif grep -qiE '^Approved:\s*yes' "$TASK_FILE" 2>/dev/null; then
  PLAN_APPROVED=1
elif grep -qiE '^Plan approved:\s*true' "$TASK_FILE" 2>/dev/null; then
  PLAN_APPROVED=1
fi

if [ "$PLAN_APPROVED" -eq 0 ]; then
  echo "$LABEL FAIL: Plan was not approved." >&2
  FAILED=1
else
  echo "$LABEL Plan: approved."
fi

# --- Validation result must be PASS ---
VALIDATION_RESULT=$(awk '
  /^## Validation result/ { found=1; next }
  found && /^## /         { exit }
  found && NF && !/^<!--/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

if [ "${VALIDATION_RESULT}" != "PASS" ]; then
  echo "$LABEL FAIL: Validation result is '${VALIDATION_RESULT:-not set}', expected PASS." >&2
  echo "$LABEL      Run ./scripts/ai/validate.sh and update the result." >&2
  FAILED=1
else
  echo "$LABEL Validation: PASS."
fi

# --- Blockers must be resolved ---
# Accepted values (case-insensitive): None, No blockers, N/A
# Also accepts: empty section, placeholder comment (<!-- ... -->), bare dash (- )
BLOCKER_CONTENT=$(awk '
  /^## Blockers/ { found=1; next }
  found && /^## / { exit }
  found          { print }
' "$TASK_FILE" | grep -v '^[[:space:]]*$' || true)

REAL_BLOCKERS=$(echo "$BLOCKER_CONTENT" \
  | grep -viE '^\s*-?\s*(none|no blockers?|n\/a)\s*$' \
  | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
  | grep -v '^[[:space:]]*-[[:space:]]*$' \
  || true)

if [ -n "$REAL_BLOCKERS" ]; then
  echo "$LABEL FAIL: Open blockers found:" >&2
  echo "$REAL_BLOCKERS" | while IFS= read -r line; do
    echo "$LABEL   $line" >&2
  done
  FAILED=1
else
  echo "$LABEL Blockers: none."
fi

# --- Retrospective notes: warn only ---
RETRO_CONTENT=$(awk '
  /^## Retrospective notes/ { found=1; next }
  found && /^## /           { exit }
  found                     { print }
' "$TASK_FILE" | grep -v '^[[:space:]]*$' || true)

REAL_RETRO=$(echo "$RETRO_CONTENT" \
  | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
  | grep -v '^[[:space:]]*-[[:space:]]*$' \
  || true)

if [ -z "$REAL_RETRO" ]; then
  echo "$LABEL WARN: Retrospective notes appear empty. Add notes before closing."
else
  echo "$LABEL Retrospective: found."
fi

# --- Final result ---
if [ "$FAILED" -eq 1 ]; then
  echo "$LABEL Final review FAILED. Fix issues before closing the task." >&2
  exit 1
fi

echo "$LABEL Final review PASSED. Task is ready for commit."
exit 0
