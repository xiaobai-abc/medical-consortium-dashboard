# Development Rules

## Code Safety

- NEVER delete existing comments unless explicitly instructed.
- NEVER remove comments that describe business logic, historical decisions, warnings, or project conventions.
- If a comment appears outdated, ask for confirmation before removing or rewriting it.

## Destructive Changes

- Before deleting code, determine whether it is:

  - legacy code
  - temporary workaround
  - business-specific behavior
  - debugging logic
- If the purpose is unclear, STOP and ask.
- Do not assume unused code can be deleted.

## Refactoring

- Preserve existing behavior unless explicitly requested.
- Do not perform large-scale refactors while fixing unrelated issues.
- Avoid changing naming conventions without approval.

## Existing Architecture

- Respect current project structure.
- Do not introduce new libraries unless necessary.
- Do not replace existing patterns simply because another approach is cleaner.

## Comments

- Existing comments are considered intentional.
- Preserve:

  - TODO
  - FIXME
  - WARNING
  - business notes
  - architecture notes
- New comments should explain WHY, not WHAT.

## Uncertainty

When confidence is below 90%:

- Stop.
- Explain uncertainty.
- Ask before modifying.

Never guess business intent.

## File Operations

- Ask before:
  - deleting files
  - moving files
  - renaming files
  - restructuring directories

## Git

- Never commit automatically.
- Never push automatically.
- Never rewrite git history.

Only perform git operations when explicitly requested.

## Output Style

- Prefer minimal changes.
- Prefer editing existing code over rewriting entire files.
- Show affected files before major modifications.


## Before Editing

Always identify:

1. Goal
2. Scope
3. Risk

Before making changes.

If scope is unclear, ask first.
