# Iron Arachne

Iron Arachne is a browser-based suite of procedural tools for tabletop role-playing games.
Game Masters and players can generate characters, cultures, religions, settlements, regions,
heraldry, dungeons, star systems, and starships. The workshop brings tools together in a workspace,
with projects and a result vault for keeping generated content in local browser storage.

The app uses **SvelteKit, Svelte 5, TypeScript, and Vite**, and builds as a static site. It needs
no backend, accounts, or service credentials to run locally.

New contributors: start here, then read [CONTRIBUTING.md](CONTRIBUTING.md) for the development
workflow, testing requirements, and architecture conventions.

## Run locally

You need **Git**, **Node.js 24** (the version used in CI), **npm** (included with Node.js), and a
modern browser. Check your installation with `git --version`, `node --version`, and `npm --version`.

```bash
git clone https://github.com/ironarachne/ironarachne.git
cd ironarachne
npm ci
npm run dev
```

`npm ci` installs the versions recorded in the lockfile. Open the local URL printed by Vite,
usually [http://localhost:5173](http://localhost:5173); it chooses another port if that one is busy.
Keep the terminal running while you work, and press Ctrl+C to stop the server.

## Check your setup

In the browser, open **All Tools**, choose a generator such as Culture, and generate a result.
You should see generated content without a browser error. In a second terminal, from the repository
directory, run the same verification gate used by CI:

```bash
npm run verify
```

A successful run exits with code 0: Svelte/TypeScript checks report **0 errors**, formatting and
lint pass, and unit tests and per-library coverage pass. Browser-test setup and the additional
checks required for UI changes are in [CONTRIBUTING.md](CONTRIBUTING.md#testing).

## Find your way around

| Path              | Purpose                                                                          |
| ----------------- | -------------------------------------------------------------------------------- |
| `src/lib/`        | Generator logic and shared libraries, with public APIs, READMEs, and unit tests. |
| `src/components/` | Svelte UI components grouped by domain.                                          |
| `src/routes/`     | Thin SvelteKit pages that compose components.                                    |
| `e2e/`            | Playwright browser tests against a production build.                             |
| `scripts/`        | Rendering previews, coverage checks, and maintenance tools.                      |
| `docs/`           | Design decisions, domain models, and focused contributor guides.                 |
| `static/`         | Static site assets.                                                              |

For the architecture, start with [the contributor guide](CONTRIBUTING.md#architecture-and-conventions),
[the workshop model](docs/workshop.md), and [the application shell](docs/app-shell.md).
[CODE_STYLE.md](CODE_STYLE.md) covers implementation conventions; individual library READMEs
explain their public APIs. Contributors working on regional rules should read
[the regional authoring guide](docs/region-authoring.md) and
[the Regions release contract](docs/regions-release-contract.md).
