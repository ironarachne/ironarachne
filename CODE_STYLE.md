# Code Style

This document describes the code style guidelines for Iron Arachne.

## Libraries

Libraries are stored in `src/lib`. Each library should focus on one specific concept and present encapsulated logic for other libraries or components to consume.

Each library should have the following structure:

```
README.md # Library README; describes the library's purpose and usage
index.ts # Library entry point; exports the library's public API
*.test.ts # Unit tests for the library, siblings to the library's source code
*.ts # Library source code
**/*.ts # Modules for the source code; avoid these if possible, preferring a flat structure
```

Libraries may also contain other supporting files, like SVGs.

## UI Components

UI components are stored in `src/components`. Each component should be a standalone, reusable UI element that can be used across the application.

Components are Svelte code, stored as PascalCase `.svelte` files, and imported via the `$components` alias. Always import through the alias, including between sibling components in the same directory; never use relative paths. Tests are not necessary for components.

Components are grouped into one level of snake_case domain directories. The domain directories mirror the site's own navigation taxonomy, so a generator's directory is predictable from where it appears in the nav:

```
src/components/
  common/      # Shared primitives: form fields, panels, dialogs, seed controls
  layout/      # Page chrome and shells: header, footer, generator/index page shells
  characters/  # Characters & People
  factions/    # Factions & Groups
  locations/   # Locations & Places
  objects/     # Objects & Items
  utilities/   # Utilities & Reference
  heraldry/    # Heraldry; cross-cutting, consumed by factions and locations
```

Keep this structure flat at one level — do not nest domain directories further. A component used by two or more domains belongs in `common/`, or in its own domain directory if it is a substantial feature in its own right (as `heraldry/` is).

## Routes

Svelte routes are stored in `src/routes`. Nesting is OK for these as long as it makes sense from a domain-narrowing perspective. The route files should be as lean as possible and reuse as many components as possible. Most UI logic should live in components, not routes.

## Coding Rules

Always use a functional style. Avoid classes. Use typescript types to describe objects and interfaces.

Group related code together within a library or component. Types should exist separately from their usage files. For example, if you have a `ShinyObject` type, the type definition should be in a file `src/lib/shiny-objects/shiny-object-types.ts`and functions for working with that type should be in a file `src/lib/shiny-objects/shiny-objects.ts`. Export functions that may be accessed from outside the library or component.

Write unit tests for all libraries. Use mutation testing (via stryker) to verify that the unit tests properly cover the library's functionality.

Functions should have the lowest possible complexity. If you have several nested conditionals, try to refactor to multiple smaller functions.

Function names should be descriptive and use camelCase. Aim for specificity in function names.

Regarding file names and directory names, use snake_case always, except for component names which should be PascalCase.

## Dependencies

Avoid introducing new dependencies unless absolutely necessary. Prefer existing dependencies over new ones.

For random number generation, always use [`@ironarachne/rng`](https://www.npmjs.com/package/@ironarachne/rng).
