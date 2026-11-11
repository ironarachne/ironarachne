# Contributing to Vastways

Vastways is Iron Arachne's browser-based workshop for tabletop worldbuilding. Start with the
[README quick start](README.md#run-locally) for Git, Node.js 24, `npm ci`, and the local dev server.
The app builds to a static site and uses the browser's storage. Local development needs no service
credentials.

## Set up a working copy

If you have repository write access, clone the upstream repository. Otherwise, fork it on GitHub,
clone your fork, and add the project as the `upstream` remote.

```bash
git remote add upstream https://github.com/ironarachne/vastways.git
```

Run `npm ci` again after pulling a lockfile change. Install Playwright's Chromium browser for
browser testing, and repeat the install after a Playwright upgrade.

```bash
npx playwright install chromium
```

On Linux, use `npx playwright install --with-deps chromium` if system libraries are missing.
Use a separate browser profile for experiments involving saves or migrations. Playwright serves a
production build on port 4173 and manages its own browser context.

## Pick an issue and make a change

1. Browse the [issue tracker](https://github.com/ironarachne/vastways/issues). Look for an unclaimed
   `ready-for-agent` issue with concrete acceptance criteria and read the discussion and linked
   designs. Ask in the issue if scope or ownership is unclear. File a focused issue for an untracked
   change, including a seed and settings if they reproduce the problem.
2. Fetch the upstream repository and branch from its current `main`. Use `origin/main` for a direct
   clone or `upstream/main` for a fork. Give the branch a short name that describes the change.
3. For work that introduces a library or concept, spans multiple libraries, or changes a persisted
   or shared data shape, write a design in `docs/` with a status and Mermaid domain model. Get
   explicit human approval of the model before implementing it. See the
   [design process](AGENTS.md#design-process). A bug fix, an addition to an existing data table, or a
   change confined to one component can go straight to implementation.
4. Keep the change focused. Add or update tests for changed library behavior, including the
   regression case for a bug and round trips or migrations for changes to stored data. For a change
   in how tools work together, test the public entry point with the real collaborators.
5. Check the diff and make focused commits with short, imperative subjects such as
   `Preserve potion provenance when saving`. Keep unrelated formatting out of the diff.

`main` is protected. Open a PR against `main` in the usual case. For a stacked PR, target its
immediate parent branch, merge from the bottom up, and add commits to any branch that someone
else has stacked on. See the [Git workflow](AGENTS.md#git-workflow).

## Testing

Run `npm run verify` before opening a PR, including for docs-only changes. It runs Svelte and
TypeScript checks, Prettier and ESLint, unit tests, and the per-library coverage gate. For changes
touching routes, components, or rendering, run `npm run verify:all` before merging and include the
result with your review evidence. The required [CI workflow](.github/workflows/ci.yaml) runs
`verify` on PRs and pushes to `main`. Run the Playwright suite locally.

During development, use `npm run check` for types, `npm run lint` for formatting and lint rules,
and `npm run test -- src/lib/potions` for a focused test run. Format individual files with
`npx prettier --write <paths>`. Use [package.json](package.json) for the script definitions and
the [testing guide](docs/testing.md) for coverage, browser subsets, and golden baselines.

Review representative generated results when an assertion cannot judge coherence, wording,
legibility, or usability. Use the same seeds and options for before and after comparisons. For
changes to generators that produce visual artifacts, put representative images directly in the
PR description. Include before and after images for changes to existing visual output and record
how to reproduce them. The [testing guide](docs/testing.md#review-generated-output) describes how to
choose cases and record intentional output changes.

## Maintain the documentation

Update the relevant guide in the same PR whenever a change affects what a contributor needs to
know. Use the narrowest source that owns the information.

- Update the [architecture guide](docs/architecture.md) or a subsystem design when a responsibility,
  boundary, or data flow changes.
- Update [code conventions](docs/code-conventions.md) or the
  [generator guide](docs/generator-development.md) when introducing a convention, generator type,
  or development pattern. Refresh worked examples affected by the change.
- Update the owning library README and examples when changing a public interface used by other
  generators. Document compatibility and migration where they apply.
- Update the README, this guide, or the [testing guide](docs/testing.md) when setup, build, testing,
  or contribution steps change. Link to scripts and config for details those files own.
- Record a replacement [decision](docs/decisions/README.md) when superseding an ADR. Mark the
  earlier record as superseded and link the two records in both directions.

Routine internal refactors, data fixes, and implementation changes that leave contributor-facing
contracts and workflows intact need no documentation edit. Explain the documentation impact in the
PR so reviewers know which guides you checked.

## Open a review-ready PR

Use the [PR template](.github/pull_request_template.md). Explain what changed and why, give the
validation commands and results, and call out any intentional changes to seeded output or
saved-data compatibility. Attach screenshots or examples for visible changes. Link the issue with
`Closes #<number>` when the PR resolves it. Use an ordinary issue reference for partial work.

A PR is ready for review when it addresses the issue's acceptance criteria, its changes and tests
are focused, required checks are green, and reviewers can reproduce the important behavior from
the evidence in the description. Use a draft while material work or validation is pending.

## Contributor references

- [Guided tour and exercises](docs/contributor-guide.md)
- [Architecture](docs/architecture.md) and [architecture decisions](docs/decisions/README.md)
- [Generator development](docs/generator-development.md) and
  [generator design principles](docs/design-principles.md)
- [Code conventions](docs/code-conventions.md) and [code style](CODE_STYLE.md)
- [Testing strategy](docs/testing.md)
