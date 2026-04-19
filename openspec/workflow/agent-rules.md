# Agent Rules

These rules apply to any AI agent (Claude, Codex, etc.) working on this project.

## General Behavior

- Follow the issue strictly
- Do not invent requirements
- Do not assume missing behavior
- If something is unclear, ask or flag it

## Architecture Rules

- Respect DDD boundaries
- Respect hexagonal architecture
- Domain must not depend on infrastructure
- Adapters must not contain business logic

## Implementation Rules

- Prefer simple and explicit code
- Avoid unnecessary abstractions
- Do not introduce new patterns unless required
- Follow existing naming conventions

## Safety Rules

- Do not modify unrelated files
- Do not refactor outside the scope
- Do not introduce breaking changes unless specified

## Output Expectations

- Code must be readable and consistent
- Changes must be minimal and focused
- The result must be easy to review