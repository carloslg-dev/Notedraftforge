#!/usr/bin/env bash
# final-review.sh — Run at the end of RETRO phase, before committing.
# Quality gate for task closure:
#   0. Validates <change-name> consistency across all sources.
#   1. Checks .ai/current-task.md: authorization, validation result, blockers, retro.
#   2. Checks openspec/changes/<change-name>/execution-record.md: existence and content.
#
# Usage:
#   ./scripts/ai/final-review.sh <change-name>
#
# <change-name> must match:
#   - a directory under openspec/changes/
#   - the "Change reference" field in .ai/current-task.md
#   - the "Change reference" field in the execution-record.md
set -euo pipefail

LABEL="[final-review]"
TASK_FILE=".ai/current-task.md"
FAILED=0

# --- Argument: change-name is mandatory ---
if [ -z "${1:-}" ]; then
  echo "$LABEL ERROR: Missing required argument <change-name>." >&2
  echo "$LABEL Usage: $0 <change-name>" >&2
  echo "$LABEL        <change-name> must match a directory under openspec/changes/" >&2
  exit 1
fi
CHANGE_NAME="$1"
RECORD_PATH="openspec/changes/${CHANGE_NAME}/execution-record.md"

# --- current-task.md must exist (local mode requirement) ---
if [ ! -f "$TASK_FILE" ]; then
  echo "$LABEL ERROR: $TASK_FILE not found." >&2
  echo "$LABEL       final-review.sh requires local task state. Create it first:" >&2
  echo "$LABEL         cp docs/ai/current-task.template.md $TASK_FILE" >&2
  exit 1
fi

# ============================================================
# Consistency: validate <change-name> across all sources
# ============================================================

echo "$LABEL Validating change-name: '$CHANGE_NAME'..."
CONSISTENCY_FAILED=0

# 1. openspec/changes/<change-name>/ folder must exist
if [ ! -d "openspec/changes/${CHANGE_NAME}" ]; then
  echo "$LABEL FAIL: Directory not found: openspec/changes/${CHANGE_NAME}/" >&2
  echo "$LABEL       Create the change directory before running final-review." >&2
  exit 1
fi
echo "$LABEL   Folder: openspec/changes/${CHANGE_NAME}/ — found."

# 2. Change reference in current-task.md must match $1
TASK_CHANGE_REF=$(awk '
  /^## Change reference/ { found=1; next }
  found && /^## /        { exit }
  found && NF && !/^<!--/ && !/^---/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

if [ -n "$TASK_CHANGE_REF" ]; then
  if [ "$TASK_CHANGE_REF" != "$CHANGE_NAME" ]; then
    echo "$LABEL FAIL: Change reference mismatch in $TASK_FILE:" >&2
    echo "$LABEL       Expected: $CHANGE_NAME" >&2
    echo "$LABEL       Found:    $TASK_CHANGE_REF" >&2
    CONSISTENCY_FAILED=1
  else
    echo "$LABEL   current-task  Change reference: '$TASK_CHANGE_REF' — matches."
  fi
else
  echo "$LABEL WARN: Change reference not set in $TASK_FILE."
  echo "$LABEL       Set it to '$CHANGE_NAME' to enable this consistency check."
fi

# 3. Change reference in execution-record.md must match $1 (only if file exists)
if [ -f "$RECORD_PATH" ]; then
  RECORD_CHANGE_REF=$(awk '
    /^## Change reference/ { found=1; next }
    found && /^## /        { exit }
    found && NF && !/^<!--/ && !/^---/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -n "$RECORD_CHANGE_REF" ]; then
    if [ "$RECORD_CHANGE_REF" != "$CHANGE_NAME" ]; then
      echo "$LABEL FAIL: Change reference mismatch in $RECORD_PATH:" >&2
      echo "$LABEL       Expected: $CHANGE_NAME" >&2
      echo "$LABEL       Found:    $RECORD_CHANGE_REF" >&2
      CONSISTENCY_FAILED=1
    else
      echo "$LABEL   execution-record Change reference: '$RECORD_CHANGE_REF' — matches."
    fi
  else
    echo "$LABEL WARN: Change reference not set in $RECORD_PATH."
    echo "$LABEL       Set it to '$CHANGE_NAME' (will also be caught by content checks below)."
  fi
fi

if [ "$CONSISTENCY_FAILED" -eq 1 ]; then
  echo "$LABEL BLOCKED: Fix change-name consistency before continuing." >&2
  exit 1
fi

# ============================================================
# Part 1: .ai/current-task.md checks
# ============================================================

echo "$LABEL Checking $TASK_FILE..."

# --- Execution authorization must be approved ---
AUTH_STATUS=$(awk '
  /^## Execution authorization/ { found=1; next }
  found && /^## /               { exit }
  found && /^Status:/           { print; exit }
' "$TASK_FILE" | sed 's/^Status:[[:space:]]*//' | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

if [ "${AUTH_STATUS}" != "approved" ]; then
  echo "$LABEL FAIL: Authorization status is '${AUTH_STATUS:-not set}', expected 'approved'." >&2
  FAILED=1
else
  echo "$LABEL   Authorization: approved."
fi

# --- Validation result must be PASS ---
VALIDATION_RESULT=$(awk '
  /^## Validation result/ { found=1; next }
  found && /^## /         { exit }
  found && NF && !/^<!--/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]')

if [ "${VALIDATION_RESULT}" != "PASS" ]; then
  echo "$LABEL FAIL: Validation result is '${VALIDATION_RESULT:-not set}', expected PASS." >&2
  echo "$LABEL      Run ./scripts/ai/validate.sh and update .ai/current-task.md." >&2
  FAILED=1
else
  echo "$LABEL   Validation: PASS."
fi

# --- Blockers must be resolved ---
# Accepted: None, No blockers, N/A, empty section, comment placeholder, bare dash
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
  echo "$LABEL   Blockers: none."
fi

# --- Retrospective notes must have content ---
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
  echo "$LABEL FAIL: Retrospective notes are empty." >&2
  echo "$LABEL      Add notes under '## Retrospective notes' in $TASK_FILE." >&2
  FAILED=1
else
  echo "$LABEL   Retrospective: found."
fi

# ============================================================
# Part 2: execution-record.md checks
# ============================================================

echo "$LABEL Checking $RECORD_PATH..."

if [ ! -f "$RECORD_PATH" ]; then
  echo "$LABEL FAIL: Execution record not found: $RECORD_PATH" >&2
  echo "$LABEL       Copy docs/ai/execution-record.template.md and fill it in." >&2
  FAILED=1
else
  # 1. Task reference must not be empty
  TASK_REF=$(awk '
    /^## Task reference/ { found=1; next }
    found && /^## /      { exit }
    found && NF && !/^<!--/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -z "$TASK_REF" ]; then
    echo "$LABEL FAIL: execution-record: 'Task reference' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Task reference: OK ($TASK_REF)"
  fi

  # 2. Change reference must not be empty (value match already checked in consistency section)
  CHANGE_REF=$(awk '
    /^## Change reference/ { found=1; next }
    found && /^## /        { exit }
    found && NF && !/^<!--/ && !/^---/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -z "$CHANGE_REF" ]; then
    echo "$LABEL FAIL: execution-record: 'Change reference' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Change reference: OK ($CHANGE_REF)"
  fi

  # 3. Execution authorization must be approved
  RECORD_AUTH=$(awk '
    /^## Execution authorization/ { found=1; next }
    found && /^## /               { exit }
    found && /^Status:/           { print; exit }
  ' "$RECORD_PATH" | sed 's/^Status:[[:space:]]*//' | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

  if [ "${RECORD_AUTH}" != "approved" ]; then
    echo "$LABEL FAIL: execution-record: Authorization status is '${RECORD_AUTH:-not set}', expected 'approved'." >&2
    FAILED=1
  else
    echo "$LABEL   Authorization: OK"
  fi

  # 4. Validation result must be PASS
  RECORD_VALIDATION=$(awk '
    /^## Validation result/ { found=1; next }
    found && /^## /         { exit }
    found && NF && !/^<!--/ && !/^---/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ "${RECORD_VALIDATION}" != "PASS" ]; then
    echo "$LABEL FAIL: execution-record: Validation result is '${RECORD_VALIDATION:-not set}', expected PASS." >&2
    FAILED=1
  else
    echo "$LABEL   Validation result: OK"
  fi

  # 5. Retrospective summary must have content
  RECORD_RETRO=$(awk '
    /^## Retrospective summary/ { found=1; next }
    found && /^## /             { exit }
    found                       { print }
  ' "$RECORD_PATH" | grep -v '^[[:space:]]*$' \
    | grep -v '^[[:space:]]*---[[:space:]]*$' \
    | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
    | grep -v '^[[:space:]]*-[[:space:]]*$' \
    || true)

  if [ -z "$RECORD_RETRO" ]; then
    echo "$LABEL FAIL: execution-record: 'Retrospective summary' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Retrospective summary: OK"
  fi

  # 6. Context used table must have at least one data row
  CONTEXT_DATA=$(awk '
    /^## Context used/ { f=1; next }
    f && /^## /        { exit }
    f && /^\|/         { print }
  ' "$RECORD_PATH" \
    | grep -v '^|[-: |]*$' \
    | grep -vF '| Source |' \
    | grep -v '^| *|' \
    || true)

  if [ -z "$CONTEXT_DATA" ]; then
    echo "$LABEL FAIL: execution-record: 'Context used' table is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Context used: OK"
  fi

  # 7. Files changed must have at least one non-placeholder entry
  FILES_CHANGED=$(awk '
    /^## Files changed/ { found=1; next }
    found && /^## /     { exit }
    found               { print }
  ' "$RECORD_PATH" | grep -v '^[[:space:]]*$' \
    | grep -v '^[[:space:]]*---[[:space:]]*$' \
    | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
    | grep -v '^[[:space:]]*-[[:space:]]*$' \
    || true)

  if [ -z "$FILES_CHANGED" ]; then
    echo "$LABEL FAIL: execution-record: 'Files changed' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Files changed: OK"
  fi

  # 8. Date completed must not be empty
  DATE_COMPLETED=$(awk '
    /^## Date completed/ { found=1; next }
    found && /^## /      { exit }
    found && NF && !/^<!--/ { print; exit }
  ' "$RECORD_PATH" | tr -d '[:space:]')

  if [ -z "$DATE_COMPLETED" ]; then
    echo "$LABEL FAIL: execution-record: 'Date completed' is empty." >&2
    FAILED=1
  else
    echo "$LABEL   Date completed: OK ($DATE_COMPLETED)"
  fi

  # 9. Decisions made must have content (None / N/A / No decisions are accepted)
  DECISIONS_CONTENT=$(awk '
    /^## Decisions made/ { found=1; next }
    found && /^## /      { exit }
    found                { print }
  ' "$RECORD_PATH" | grep -v '^[[:space:]]*$' \
    | grep -v '^[[:space:]]*---[[:space:]]*$' \
    | grep -viE '^\s*-?\s*<!--.*-->\s*$' \
    | grep -v '^[[:space:]]*-[[:space:]]*$' \
    || true)

  if [ -z "$DECISIONS_CONTENT" ]; then
    echo "$LABEL FAIL: execution-record: 'Decisions made' is empty." >&2
    echo "$LABEL       Use 'None', 'N/A', or 'No decisions' if none were made." >&2
    FAILED=1
  else
    echo "$LABEL   Decisions made: OK"
  fi
fi

# ============================================================
# Final result
# ============================================================

if [ "$FAILED" -eq 1 ]; then
  echo "$LABEL Final review FAILED. Fix issues before committing." >&2
  exit 1
fi

echo "$LABEL Final review PASSED. Task is ready for commit."
exit 0
