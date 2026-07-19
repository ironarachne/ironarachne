# Iron Arachne

Iron Arachne is a suite of procedural generation tools designed for tabletop role-playing games (TTRPGs). It helps Game Masters and players quickly create content ranging from characters and cultures to entire star systems and regions.

This project is built using [SvelteKit](https://kit.svelte.dev/).

## Features

Iron Arachne includes generators for a wide variety of settings and systems, including:

- **Characters**: Generate detailed NPCs with stats, appearance, and backstories.
- **World Building**: Create cultures, religions, regions, and settlements.
- **Sci-Fi**: Generate star systems, planets, and starships (compatible with systems like Stars Without Number).
- **Fantasy**: Tools for AD&D, heraldry, and fantasy-specific content.
- **Utilities**: Dice rollers, word generators, and more.

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Modern CSS (custom properties, nesting, `color-mix`)

## Development Setup

### Prerequisites

- Node.js (Latest LTS recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

### Running Development Server

To start the development server with hot reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create a production build:

```bash
npm run build
```

You can preview the production build locally using:

```bash
npm run preview
```

### Testing

Unit tests (Vitest, library code under `src/lib/`):

```bash
npm run test
```

End-to-end tests (Playwright, all pages against a production preview build):

```bash
npx playwright install chromium
npm run test:e2e
```

The first command installs the Chromium browser Playwright uses. You only need to run it once per machine (or after upgrading `@playwright/test`).

Other e2e commands:

```bash
npm run test:e2e:ui      # interactive UI mode for debugging
npm run test:e2e:headed  # run tests in a visible browser window
```

`npm run test:e2e` builds the site, starts `vite preview` on port 4173, and runs the Playwright suite. Unit tests (`npm test`) and e2e tests are kept separate so library tests stay fast.

Mutation testing, via StrykerJS:

```bash
npx stryker run
```

**Note:** Mutation testing will take hours to run if run against the entire project. Don't do that. Instead, update the configuration file `stryker.conf.json` to target specific libraries. Also, it doesn't work on Svelte, so don't run it against Svelte components.

### Code Quality

To check for TypeScript and Svelte issues:

```bash
npm run check
```
