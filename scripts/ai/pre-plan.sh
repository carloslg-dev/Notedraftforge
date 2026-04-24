#!/usr/bin/env bash
# pre-plan.sh — Run before starting the PLAN phase.
# Checks that required documents exist and task state is ready.
# Blocks (exit 1) if required docs/ai/ documents are missing.
# Warns only if .ai/current-task.md is missing.
set -euo pipefail

LABEL="[pre-plan]"
FAILED=0

# --- Required docs/ai/ documents (block if missing) ---
REQUIRED_DOCS=(
  "docs/ai/workflow.md"
  "docs/ai/agent-rules.md"
  "docs/ai/context-strategy.md"
  "docs/ai/done-definition.md"
  "docs/ai/current-task.template.md"
)

echo "$LABEL Checking docs/ai/ documents..."
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$doc" ]; then
    echo "$LABEL ERROR: Missing required document: $doc" >&2
    FAILED=1
  else
    echo "$LABEL   OK  $doc"
  fi
done

# --- Required openspec/ documents (block if missing) ---
REQUIRED_OPENSPEC=(
  "openspec/project.md"
  "openspec/workflow/workflow-rules.md"
)

echo "$LABEL Checking openspec/ documents..."
for doc in "${REQUIRED_OPENSPEC[@]}"; do
  if [ ! -f "$doc" ]; then
    echo "$LABEL ERROR: Missing required document: $doc" >&2
    FAILED=1
  else
    echo "$LABEL   OK  $doc"
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "$LABEL BLOCKED: Required documents are missing. Fix before planning." >&2
  exit 1
fi

echo "$LABEL All required documents found."

# --- Task state: warn only ---
if [ ! -f ".ai/current-task.md" ]; then
  echo "$LABEL WARN: .ai/current-task.md not found."
  echo "$LABEL       Create it before starting:"
  echo "$LABEL         cp docs/ai/current-task.template.md .ai/current-task.md"
else
  echo "$LABEL   OK  .ai/current-task.md"
fi

echo "$LABEL Ready to plan."
exit 0
