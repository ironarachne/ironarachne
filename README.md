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
npm run test:e2e:ui       # interactive UI mode for debugging
npm run test:e2e:headed   # run tests in a visible browser window
npm run test:e2e:desktop  # desktop Chrome only
npm run test:e2e:mobile   # phone widths only
```

`npm run test:e2e` builds the site, starts `vite preview` on port 4173, and runs the Playwright suite. Unit tests (`npm test`) and e2e tests are kept separate so library tests stay fast.

### Mobile layout baseline

`e2e/pages.mobile.spec.ts` runs every route in the page manifest at each width in `e2e/mobile_viewports.ts` (320, 360, 375, 390, and 430 CSS pixels), as a `mobile-<width>` Playwright project per width. Each page is generated with a pinned seed so the content — and therefore its width — is the same every run, then checked for horizontal overflow and for controls pushed off screen.

The point is to keep desktop-oriented redesigns from silently breaking phones. If a change makes something wider than the screen, these fail and name the offending element. Add a width to `MOBILE_VIEWPORTS` and the matching project appears automatically.

Mutation testing, via StrykerJS:

```bash
npx stryker run
```

Check the output in the `reports/mutation` directory.

**Note:** Mutation testing will take hours to run if run against the entire project. Don't do that. Instead, update the configuration file `stryker.conf.json` to target specific libraries. Also, it doesn't work on Svelte, so don't run it against Svelte components. Alternatively, you can run `npx stryker run -m src/lib/my_dir/my_file.ts` to test individual files without changing configuration.

### Code Quality

To check for TypeScript and Svelte issues:

```bash
npm run check
```
