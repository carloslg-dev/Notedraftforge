#!/usr/bin/env bash
# post-edit-hook.sh — PostToolUse adapter for Claude Code.
# Calls scripts/ai/post-edit.sh after resolving repo root.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO_ROOT"
./scripts/ai/post-edit.sh
