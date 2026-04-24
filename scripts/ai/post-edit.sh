#!/usr/bin/env bash
# post-edit.sh — Run after editing application files.
# Informational only: lists modified files and reminds what to update.
# Never blocks (always exits 0).
set -euo pipefail

LABEL="[post-edit]"
TASK_FILE=".ai/current-task.md"

# --- List modified files (staged + unstaged) ---
echo "$LABEL Files modified in working tree:"

CHANGED_UNSTAGED=$(git diff --name-only 2>/dev/null || true)
CHANGED_STAGED=$(git diff --name-only --cached 2>/dev/null || true)
ALL_CHANGED=$(printf '%s\n%s\n' "$CHANGED_UNSTAGED" "$CHANGED_STAGED" \
  | sort -u | grep -v '^$' || true)

if [ -z "$ALL_CHANGED" ]; then
  echo "$LABEL   (no changes detected in git working tree)"
else
  echo "$ALL_CHANGED" | while IFS= read -r line; do
    echo "$LABEL   $line"
  done
fi

# --- Reminders ---
echo ""
echo "$LABEL Next steps:"
echo "$LABEL   1. Update 'Files actually changed' in $TASK_FILE"
echo "$LABEL   2. Update 'Commands run' in $TASK_FILE"
echo "$LABEL   3. Set 'Current phase' to VALIDATE in $TASK_FILE"
echo "$LABEL   4. Run ./scripts/ai/validate.sh"

exit 0
