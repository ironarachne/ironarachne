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
- **Styling**: Sass

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

To run the test suite:

```bash
npm run test
```

### Code Quality

To check for TypeScript and Svelte issues:

```bash
npm run check
```
