# Contributing to Iron Arachne

Use the [README](README.md#run-locally) to install and run the app. This guide covers what to do
after setup. [AGENTS.md](AGENTS.md) records the full repository contracts and their rationale;
[CODE_STYLE.md](CODE_STYLE.md) is the implementation style guide.

## Making a change

1. Find or open a [GitHub issue](https://github.com/ironarachne/ironarachne/issues) describing the
   problem and expected behavior.
2. Create a working branch from an up-to-date `main`.
3. Make a focused change, adding or updating tests for changed library behavior.
4. Run the required checks below and open a pull request explaining the problem, the resulting
   behavior, and how you verified it. Link the issue with `Closes #<number>` when it is resolved.

Larger features need a design document in `docs/` before implementation: anything introducing a
library or concept, spanning multiple libraries, or changing persisted or shared data shapes.
Include a status line and a domain model expressed as Mermaid class diagrams, then obtain explicit
human approval of the model before implementing it. See [the design process](AGENTS.md#design-process)
and [the workshop design](docs/workshop.md) for an example. Small fixes and changes confined to one
component can go straight to implementation.

`main` is protected: changes go through a pull request with a green `verify` check. If you use stacked
PRs, merge the bottom first and only add commits to branches that other work is based on; see
[the Git workflow](AGENTS.md#git-workflow).

## Testing

Run this for every change, including documentation:

```bash
npm run verify
```

It runs Svelte/TypeScript checks, Prettier and ESLint, unit tests, and the per-library coverage
gate. Libraries must meet 80% line and function coverage, or preserve their recorded existing
baseline. Never add or lower a coverage baseline to make a change pass.

For changes touching routes, components, or rendering, install Playwright's Chromium browser and
run the full gate **before merging**:

```bash
npx playwright install chromium
npm run verify:all
```

Install Chromium once per machine and again after Playwright upgrades. On Linux, if browser system
dependencies are missing, use `npx playwright install --with-deps chromium` (it may require elevated
permissions). Playwright builds the app, serves a production preview on port 4173, and runs desktop
and mobile tests. Browser tests run in CI after merges to `main`, so local verification is required
for these changes.

Useful commands while working:

| Command                             | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `npm run check`                     | Check TypeScript and Svelte.                      |
| `npm run test -- src/lib/culture`   | Run a focused set of unit tests.                  |
| `npm run lint`                      | Check formatting and lint rules.                  |
| `npm run format`                    | Format the repository; review the resulting diff. |
| `npm run test:e2e:desktop`          | Run desktop browser tests.                        |
| `npm run test:e2e:mobile`           | Check every route at the configured phone widths. |
| `npm run test:e2e:ui`               | Debug browser tests interactively.                |
| `npm run build` / `npm run preview` | Build the static site / serve it locally.         |

Unit tests live beside library source in `src/lib/**/*.test.ts`; browser tests live in `e2e/`.
The mobile suite uses pinned seeds to check for horizontal overflow and off-screen controls.
Mutation testing is a targeted human-run tool: use `npx stryker run -m src/lib/my_dir/my_file.ts`
for an individual file, never the entire project or Svelte components.

## Architecture and conventions

The dependency direction is **libraries → components → routes**. Libraries hold application logic
and know nothing about Svelte; components render the UI; routes compose components.

- **Libraries:** one concept per directory in `src/lib/`, with an `index.ts` public API, a README,
  and co-located tests. Import other libraries through `$lib/<library>`; use relative imports for
  siblings within a library. Use TypeScript types and functional code.
- **Components:** PascalCase `.svelte` files, grouped one level deep by domain, imported through
  `$components`. Shared UI belongs in `common/`.
- **Tools:** each generator, editor, or reference route needs a [catalog entry](src/lib/tools/README.md)
  and a matching [workshop panel](src/lib/workshop/README.md). The catalog controls discovery and
  tool maturity; see [tool readiness](docs/tool-readiness.md).
- **Randomness:** use `@ironarachne/rng`, with one seeded RNG threaded through a generation run.
  Never use `Math.random`; output must be reproducible from its seed.
- **Persistence:** generated work belongs to projects as artifacts in IndexedDB. Start with
  [the workshop model](docs/workshop.md) and the library READMEs for
  [projects](src/lib/projects/README.md) and [artifacts](src/lib/artifacts/README.md).
- **Assets:** vendored brand assets must be changed upstream and synced rather than edited in
  place. Follow [the brand-assets guide](docs/brand-assets.md).

Use these guides when working in the corresponding area:

- [Application shell and navigation](docs/app-shell.md)
- [Regional data flow and authoring](docs/region-authoring.md) and
  [Regions release contract](docs/regions-release-contract.md)
- [Rendering pipelines](docs/renderers.md) and [visual design](docs/visual-design.md)
- [Generated narrative prose](docs/narrative-prose.md)
- [Versioning](docs/versioning.md) and [deployment](docs/deployment.md)
