# Workflow Rules

## General Principle

This project follows Spec-Driven Development (SDD).

No code should be written without a clear spec.

---

## Development Flow

1. Define or update spec
2. Create issue based on spec
3. Implement issue
4. Review code
5. Update documentation if needed

---

## Issue Rules

Each issue must include:
- Clear goal
- Defined scope (includes / excludes)
- Acceptance criteria
- Reference to spec
- Reference to decision IDs when applicable (`D-XX`)

---

## Implementation Rules

- Keep changes small and focused
- Do not mix multiple concerns in one issue
- Do not introduce undocumented behavior

---

## Review Rules

- Validate against spec, not intuition
- Check domain consistency
- Check architectural boundaries
- Reject unclear or risky changes

---

## Documentation Rules

- Specs are the source of truth
- Code must reflect specs
- If behavior changes → update spec
- Cross-spec or architectural decisions must be logged in `openspec/decisions/decisions.md`

---

## Commit Message Convention

Use Conventional Commits in English:
- `type(scope): message`

Common types:
- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat(annotation): add needsReview resolution flow`
- `fix(snapshot): prevent duplicate regeneration on toggle`
- `chore(docs): update workflow and templates`

---

## Anti-Rules

- No "quick hacks"
- No silent assumptions
- No hidden logic
- No skipping review
