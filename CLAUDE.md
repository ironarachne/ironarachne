# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Iron Arachne is a SvelteKit (Svelte 5) app: a suite of procedural generators for TTRPGs (characters,
cultures, settlements, star systems, heraldry, dungeons, and more). Built with TypeScript, Vite, and
`@sveltejs/adapter-static`. See CODE_STYLE.md for the full style guide; the summary below covers what
isn't obvious from a single file.

## Commands

```bash
npm run dev              # dev server
npm run build             # production build (static adapter)
npm run preview           # preview a production build
npm run check              # svelte-kit sync + svelte-check (TS/Svelte type errors)

npm run test               # vitest run (all unit tests, src/lib/**)
npm run test -- mypath     # run a subset of unit tests — prefer this while iterating
npm run test:coverage      # vitest with coverage (80% lines/statements/functions threshold)

npm run test:e2e           # Playwright: builds, serves preview on :4173, runs full suite
npm run test:e2e:desktop   # Chromium only
npm run test:e2e:mobile    # phone-width projects only (320/360/375/390/430px)
npm run test:e2e:ui        # interactive Playwright UI
npm run test:e2e:headed    # visible browser

npm run lint                # prettier --check . && eslint .
npm run format              # prettier --write .

npx stryker run -m src/lib/my_dir/my_file.ts   # mutation test one file (see note below)
```

Notes:

- Unit tests (Vitest) live beside their source in `src/lib/**/*.test.ts` and are excluded from
  e2e collection. E2e tests (Playwright) live in `e2e/` and run against a built+served preview,
  not the dev server.
- Don't run `npx stryker run` project-wide (hours-long) or against Svelte components (unsupported).
  Target a single library via `stryker.conf.json` or the `-m` flag, and leave running it to humans
  per this repo's testing policy.
- `e2e/pages.mobile.spec.ts` renders every route in the page manifest at each width in
  `e2e/mobile_viewports.ts` with a pinned seed (deterministic content/width) and fails on
  horizontal overflow or off-screen controls. Add a width to `MOBILE_VIEWPORTS` to get a new
  Playwright project automatically.

## Architecture

### Three-layer structure: lib → components → routes

- **`src/lib/`** — one directory per concept (e.g. `culture`, `heraldry`, `dice`, `tags`), each
  with an `index.ts` public API, a README, and co-located tests. Libraries hold all real logic;
  they know nothing about Svelte.
- **`src/components/`** — Svelte UI, PascalCase files, imported only via the `$components` alias
  (never relative, even between siblings). Grouped one level deep into snake_case domain
  directories that mirror the site's nav (`characters/`, `factions/`, `locations/`, `objects/`,
  `utilities/`, `heraldry/`, plus `common/` and `layout/`). A component shared across domains goes
  in `common/`; don't nest domain directories further.
- **`src/routes/`** — SvelteKit routes, kept thin; they compose components rather than holding
  logic. Nesting mirrors domain narrowing (e.g. `fantasy/dcc`, `swn/character`).

### The tool catalog (`src/lib/tools`) and workshop (`src/lib/workshop`)

Every generator/editor/reference page a visitor can reach from nav has an entry in the tool
catalog, created with `defineTool` (path, label, `kind`, `domain`, optional `genres`/`systems`).
Index pages and nav build their links from this catalog — it's the single source of truth for
a tool's name and classification. New routes reachable from navigation need a catalog entry.

`workshop` maps a catalog `path` to the Svelte component that renders it (`TOOL_PANELS`), so tools
can be mounted in a panel (e.g. a multi-tool workspace) instead of only on their own route. Import
specifiers in `TOOL_PANELS` are written out in full (not computed) because dynamic imports must be
statically analyzable for code-splitting — a computed specifier would bundle every generator,
including WebGL and PDF export code, into any page that opens one panel. Tests enforce that the
catalog and `TOOL_PANELS` agree in both directions.

### Tagging (`src/lib/tags`)

A generic `applyTagFilter`/`TaggedItem`/`TagFilter` system used across the codebase for anything
filterable. The tool catalog builds genre (`genre:fantasy`) and game-system (`system:swn`) filters
as namespaced tags on top of this rather than as dedicated fields, so one filtering mechanism
serves tools, and other tagged content, uniformly.

### RNG and determinism

All randomness goes through `@ironarachne/rng` (`RNG` class), never `Math.random`. The normal
pattern: a generator's entry point takes a `seed: string` and instantiates its own local
`new RNG(seed)`, then threads that single instance down through an `rng: RNG` parameter to
whatever internal helpers need randomness — so a whole generation run is reproducible from one
seed (used heavily by e2e's pinned-seed mobile tests). Some smaller/internal generators are handed
an existing `RNG` instance directly instead of a seed, when they're always called as part of a
larger generation run that already owns one. When a callback signature requires an unused `rng`
param (e.g. DCC occupation `apply` handlers), prefix it `_rng` rather than dropping it, to keep the
contract visible.

### Saved data (`src/lib/persistent_save`, `src/routes/saved-data`)

Generated content can be saved to `localStorage` (via `scoped_local_storage`) and browsed/exported
from `/saved-data`. `strip_function_values_deep` sanitizes generator output (which may carry
closures) before it's persisted or exported. This pattern will change in the near future to support a universal "result vault," so don't rely on it.

### Rendering pipelines

Several libraries produce non-DOM output and are wired together rather than standalone:
`renderers`, `map`/`noise`/`geometry` (procedural maps), `dungeon`/`shaders` (Three.js + GLSL,
loaded via `vite-plugin-glsl`), `graphics`/`visual_identity`/`heraldry`/`disc_emblem` (SVG, built
with `xmlbuilder2`), and `pdf`/`download` (jsPDF export). If you touch one of these, check for a
matching `scripts/render_*.ts` CLI entry point used to preview output outside the browser.

## Git workflow

- Remote is Worktree.ca (Forgejo) — use the worktree MCP tool for PRs/issues, not `gh` or other
  GitHub-only tooling.
