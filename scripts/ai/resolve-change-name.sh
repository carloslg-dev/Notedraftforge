#!/usr/bin/env bash
# resolve-change-name.sh — Reads the Change reference from .ai/current-task.md and prints it.
# Always exits 0. Prints nothing if file missing or field unset.
set -euo pipefail

TASK_FILE=".ai/current-task.md"
[ ! -f "$TASK_FILE" ] && exit 0

awk '
  /^## Change reference/ { found=1; next }
  found && /^## /        { exit }
  found && NF && !/^<!--/ && !/^---/ { print; exit }
' "$TASK_FILE" | tr -d '[:space:]'

exit 0
