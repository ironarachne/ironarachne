---
name: tool
description: Audit or plan an Iron Arachne generator, editor, or reference tool against the catalog, workshop, persistence, determinism, testing, and mobile-readiness contracts. Use when adding a tool, finishing a tool, or invoking $tool.
---

# Tool Readiness

Use this skill for a route, tool issue, or named generator. It is an audit and planning workflow by
default, not an excuse to start implementation without understanding the tool's boundaries.

## Establish the subject

If the caller gives an issue number, read it and its comments with `gh issue view <number> --comments`.
If the caller gives a route, resolve it to the route component, catalog entry, panel registration, and
underlying library. If the subject is ambiguous, ask for the route or issue rather than choosing a
similar tool.

Read the relevant design and readiness documents first. In particular:

- `docs/tool-readiness.md` for the shared release-readiness contract
- The matching `docs/readiness-*.md` document when the tool is part of that pass
- `docs/workshop.md` for catalog, panel, and maturity rules
- `AGENTS.md` for layering, RNG, testing, and design-gate rules

Inspect the current worktree and the relevant branch or issue before reporting work as missing. Issue
claims may be stale; verify them against code.

## Audit checklist

Classify the subject as a generator, editor, or reference tool. Do not require generator-only output
or persistence features from a reference tool. For a generator or editor, inspect each applicable item:

### Registration and composition

- The route exists and follows the route structure.
- The tool has exactly one catalog entry created through the established catalog API.
- The catalog path, label, kind, domain, maturity, genre, and system metadata are accurate.
- The catalog path and `TOOL_PANELS` agree in both directions.
- The route composes components instead of owning generator logic.
- Components use `$components` imports and the expected domain directory.

### Generation and state

- The entry point accepts an explicit seed or uses the established parent RNG contract.
- One seeded RNG is threaded through all random helpers; no hidden clock or second random stream is
  introduced.
- The seed is visible and controllable through the established `SeedControls` pattern where the tool
  generates output.
- Configuration defaults do not instantiate their own time-seeded RNG when a caller-owned RNG should
  be used.
- The generated output has a stable name or title where the catalog/workshop requires one.

### Saved artifacts and exports

For tools that produce user work, check the shared artifact architecture rather than inventing a
tool-local saved state:

- Snapshot, rehydration, artifact kind, version, validation, migration, and deferred codec are present
  where applicable.
- The kind is registered in the artifact catalog and the editor in the artifact editor registry.
- Persisted values contain no closures or other unserializable runtime values.
- Editing is snapshot-to-snapshot and re-rolls use the same seeded path as initial generation.
- Presentation/export output is built from the stored form and drops empty sections.
- `SaveArtifactButton`, pickers, and export controls are present where the design requires them.

### Tests and browser behavior

- The library has `README.md`, `index.ts`, and co-located tests.
- Tests cover the public API, invalid or boundary inputs, same-seed reproducibility, and relevant
  snapshot/migration behavior.
- Coverage meets the per-library gate; never solve a failure by adding or lowering a baseline entry.
- The route is represented in `e2e/page_manifest.ts` when it is a page covered by the route sweep.
- Focused Playwright coverage exists for important generation, saving, editing, export, or loading
  behavior.
- Mobile behavior is covered by the pinned-seed page sweep and any tool-specific tests needed for
  controls that the sweep cannot reach.
- Route, component, or rendering changes require `npm run verify:all`, not only `npm run verify`.

## Design gate

If the work introduces a new library or concept, spans multiple libraries, or changes persisted or
inter-library data, stop at a design proposal. The proposal belongs in `docs/`, includes a `**Status:**`
line, and has a `## Domain model` section with Mermaid class diagrams. Do not implement the types or
schema until a human explicitly approves that model.

A new data-table entry, bug fix, or change confined to one component does not need a design document.

## Report format

Report findings first, ordered by severity. Each finding must include:

`file:line — missing or incorrect contract — concrete consequence`

Then report:

- Scope inspected and any assumptions
- Contract items that are already satisfied
- Decisions required, with a recommendation for each
- A smallest-first implementation breakdown
- Exact focused tests and verification commands
- Whether human design approval is required before implementation

Do not call a tool release-ready when a finding is unverified. Say what could not be checked. Do not
edit source code during an audit unless the caller explicitly asks to implement an already-approved
plan.
