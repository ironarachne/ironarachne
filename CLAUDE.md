# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Iron Arachne is a SvelteKit (Svelte 5) app: a suite of procedural generators for TTRPGs (characters,
cultures, settlements, star systems, heraldry, dungeons, and more). Built with TypeScript, Vite, and
`@sveltejs/adapter-static`. See CODE_STYLE.md for the full style guide; the summary below covers what
isn't obvious from a single file.

## Commands

```bash
npm run verify             # the gate: check + lint + tests + coverage, one exit code (~40s)
npm run verify:all         # verify plus the full Playwright suite
npm run coverage:check     # tests with coverage, then the per-library coverage gate

npm run dev              # dev server
npm run build             # production build (static adapter)
npm run preview           # preview a production build
npm run check              # svelte-kit sync + svelte-check (TS/Svelte type errors)

npm run test               # vitest run (all unit tests, src/lib/**)
npm run test -- mypath     # run a subset of unit tests — prefer this while iterating
npm run test:coverage      # vitest with coverage; writes coverage/coverage-summary.json

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

- `npm run verify` is the definition of done for a change, and it is what CI runs on a PR. It
  must be green on `main` at all times — `svelte-check` reporting anything other than
  `0 ERRORS` is a bug to fix, not noise to step around, because a gate nobody trusts is not a
  gate.
- **`npm run verify:all` before merging anything that touches routes, components, or
  rendering.** This is not optional politeness: no Playwright runs against a PR, so you are the
  only thing standing between a browser-visible regression and `main`.
- CI is two workflows. `.github/workflows/ci.yaml` runs `verify` on every PR and every merge,
  and is the only required check. `.github/workflows/e2e.yaml` runs the browser suite on
  merges to `main` only — never on a PR, because the suite takes about seventeen minutes and
  `npm run verify:all` locally is the faster loop for a rendering change. A red run there is a
  signal to investigate, not a blocked merge; `e2e.yaml` carries the full reasoning.
  `.github/workflows/goldens.yaml` is the third workflow and gates nothing: it is dispatch-only,
  renders the golden-image baselines, and pushes them to a branch for review. `build.yaml`,
  `promote-staging.yaml`, `promote-prod.yaml` and `publish-landing.yaml` deploy; see
  `docs/deployment.md`.
- **Coverage is enforced per library, not project-wide.** `scripts/check_library_coverage.ts`
  requires every directory under `src/lib` to reach 80% line and function coverage. The
  exception is the debt recorded in `scripts/library_coverage_baseline.json`: those libraries
  were already below the bar when the gate was added, and each is pinned at the figure it had,
  so it cannot get worse. That file is meant only to shrink — when a library reaches 80% the
  gate tells you to delete its entry. **Never add an entry or lower one to make a run pass**;
  a new library below the bar needs tests, and exempting it is the single thing the gate exists
  to prevent. Note that `vite.config.js` sets `coverage.include` deliberately: without it v8
  reports only files some test happened to load, so an untested library is missing from the
  report rather than showing as zero.
- **There is exactly one `coverage.exclude` entry that is not a test file**, and it is not a
  precedent to copy casually. `src/lib/renderers/webgl_scene_draw.ts` submits an already-decided
  draw list to the GPU and cannot run without a GL context; `e2e/preview_pixels.spec.ts` covers
  it in a real browser instead. An exclusion claims "verified by another suite", where a baseline
  entry admits "untested debt" — so it is honest only while that suite exists, it must name what
  covers it in a comment, and it must be **file-scoped**: a directory pattern would silently
  swallow every file added beside it. If you cannot name the other suite, the answer is tests.
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

### Vendored brand assets

The icons in `static/`, the fonts in `src/lib/assets/fonts/`, and the colour palette in
`src/lib/styles/brand/` are copies from
`ironarachne/ironarachne_branding`, pinned to a commit in `brand-assets.json` and copied by
`scripts/sync_brand_assets.sh` (`--check` reports drift). **Never edit or rename a vendored asset in
place** — change it in the brand repo and sync, because editing both sides is exactly how these
silently diverged twice, and a rename makes the next sync add a duplicate rather than overwrite.
Anything else vendored from that repo (lockups) goes in the same pin rather than growing a second
mechanism. See `docs/brand-assets.md`.

## Design process

Larger features are designed before they are built. "Larger" means anything that introduces a new
library or a new concept, spans more than one library, or changes the shape of data that is
persisted or handed between libraries. A bug fix, another entry in an existing data table, or a
change confined to a single component is not larger — those go straight to implementation.

The sequence is:

1. **Design document** — a markdown file in `docs/`, stating the problem, the shape of the solution,
   and the decisions taken. Follow the existing ones (`docs/workshop.md`,
   `docs/crafting-system.md`), including a `**Status:**` line saying whether the document is a
   proposal, accepted, or implemented.

2. **Domain model** — a `## Domain model` section in that same document, expressing the feature's
   types and their relationships as one or more [Mermaid](https://mermaid.js.org/) class diagrams.
   Model the nouns, not the call flow: fields with their TypeScript types, associations with
   cardinality, and variants. What the diagram declares is what the implementation's `*-types.ts`
   files will declare, so this is where the data shape gets settled.

   ````markdown
   ```mermaid
   classDiagram
       class Project {
           +string id
           +string name
       }
       class Artifact {
           +string id
           +ArtifactKind kind
       }
       Project "1" o-- "*" Artifact : contains
       Artifact "*" --> "*" Artifact : references
   ```
   ````

   Split a model into several diagrams when one grows too dense to read; a diagram nobody can follow
   defeats the point.

3. **Human review** — a human reads the diagrams and explicitly approves them. **Implementation does
   not start before that approval.** Reworking a class diagram costs minutes; reworking the types it
   would have caught costs a great deal more.

Break a design into work items only after the model is approved.

## Git workflow

- Remote is GitHub (`ironarachne/ironarachne`) — use the `gh` CLI for PRs, issues and runs.
  The repository moved here from Worktree.ca; issues carry a footer linking their original.
- `main` is protected on the remote: direct pushes are rejected, and a PR cannot merge until
  `verify` reports green. That is the only required context — the browser suite deliberately
  does not gate a PR (see `.github/workflows/e2e.yaml`). Work on a branch and open a PR; there
  is no path that bypasses this.

## Agent configuration

`.claude/settings.json` is checked in and applies to everyone. It holds the shared permission
allowlist — this project's own tooling and the `gh` calls the workflow depends on — plus
three hooks:

- **Format on edit** (`PostToolUse` on `Write|Edit`) runs Prettier on the file just written, so
  formatting never becomes a review comment or a failed `lint` in CI.
- **Protected-branch guard** (`PreToolUse` on `Bash`, `.claude/hooks/guard_protected_branch.sh`)
  refuses a commit, merge, rebase, cherry-pick, or revert while on `main`/`master`, refuses any
  force-push, and refuses a push aimed at a protected branch. `git pull` is deliberately allowed —
  fast-forwarding `main` is how you keep it current.
- **Secret scan** (`PreToolUse` on `Bash`, `.claude/hooks/scan_staged_secrets.sh`) inspects what a
  `git commit` is about to record and refuses recognisable credentials: AWS keys, private key
  blocks, GitHub/Slack/npm/PyPI tokens, long values assigned to a `password`/`secret`/`token`
  variable, and files such as `.env`, `*.pem`, or `id_rsa`. Only added lines are scanned.

Both guards fail open — if the script itself errors, the command proceeds. A guard that blocked all
work whenever it broke would be turned off, and then it would guard nothing. They are a safety net
for the ordinary mistake, not a barrier against a determined bypass; the binding controls are
branch protection and required status checks on the remote.

Note that the branch guard reads the branch of the _hook's_ working directory. A command that
`cd`s into a different repository before committing is not covered.

Each guard locates its script by trying the working directory first and `$CLAUDE_PROJECT_DIR`
second, and runs nothing if neither has it. That matters because `$CLAUDE_PROJECT_DIR` points at
the main checkout even when the session is in a worktree under `.claude/worktrees/`, so resolving
it alone would miss the scripts there — and invoking a path that does not exist reports a hook
error on every single Bash call rather than failing quietly.

Changing `.claude/settings.json` mid-session does not reliably take effect: the settings watcher
only picks up directories that already had a settings file when the session started. Open `/hooks`
once, or restart, after editing it.

### Slash commands

`.claude/commands` holds four commands covering the workflows that repeat here. Each encodes
what was learned doing the job by hand, so the knowledge lives with the task rather than in
someone's memory:

- **`/ci [pr]`** — waits for a PR's checks and, on failure, fetches the job log and says what
  actually broke. Carries the two traps that have produced wrong reports before: the commit-statuses
  API returns every status ever posted, and a _skipped_ job reports as `success`.
- **`/triage <issue>`** — verifies an issue's claims rather than trusting them, records findings and
  the decisions they force, and moves the label along `needs-triage` → `needs-design` →
  `ready-for-agent`.
- **`/promote <env> <version>`** — opens the `deploy/<env>.version` PR that deploys a released
  version. Checks the release exists _authenticated_ first, because a draft release is invisible to
  unauthenticated callers and will pass a casual check then fail the deploy.
- **`/release <major|minor|patch>`** — bumps `package.json` and opens the PR that cuts the tag and
  release.

The commands are mirrored between `.claude/commands` and `.opencode/commands`, the same way agents
and hooks are. Keep them in step; the bodies are identical and only the frontmatter differs.

Personal, machine-specific permissions belong in `.claude/settings.local.json`, which is gitignored
— keep broad rules such as bare interpreters out of the shared file. Put nothing secret in either;
neither file is a place for credentials.
