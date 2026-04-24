#!/usr/bin/env bash
# pre-edit-hook.sh — PreToolUse adapter for Claude Code.
# Reads the target file path from tool input (stdin JSON: tool_input.file_path).
# .ai/current-task.md is exempt: phase/auth checks do not apply to it.
# All other files go through scripts/ai/pre-edit.sh (exit 1 → exit 2 to block).

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO_ROOT"

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null \
  || echo "")

case "$FILE_PATH" in
  .ai/current-task.md|*/.ai/current-task.md)
    exit 0
    ;;
esac

./scripts/ai/pre-edit.sh || exit 2
