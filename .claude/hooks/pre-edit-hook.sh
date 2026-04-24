#!/usr/bin/env bash
# pre-edit-hook.sh — PreToolUse adapter for Claude Code.
# Calls scripts/ai/pre-edit.sh and translates exit 1 → exit 2 to block the tool call.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO_ROOT"
./scripts/ai/pre-edit.sh || exit 2
