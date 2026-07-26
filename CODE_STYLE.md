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

## The Tool Catalog

Every user-facing tool — generator, editor, or reference page — has an entry in
[`src/lib/tools`](src/lib/tools/README.md). The entry holds the tool's nav label, its kind and
domain, and its metadata: an optional genre and an optional game system, both stored as
namespaced tags (`genre:fantasy`, `system:swn`) so tools filter with the same
`applyTagFilter` everything else uses.

A new route that a visitor can reach from navigation needs a catalog entry. The index pages
build their links from it, so the catalog is the one place a tool's name and classification
live.

## Coding Rules

Always use a functional style. Avoid classes. Use typescript types to describe objects and interfaces.

Group related code together within a library or component. Types should exist separately from their usage files. For example, if you have a `ShinyObject` type, the type definition should be in a file `src/lib/shiny-objects/shiny-object-types.ts`and functions for working with that type should be in a file `src/lib/shiny-objects/shiny-objects.ts`. Export functions that may be accessed from outside the library or component.

Write unit tests for all libraries. Use mutation testing (via stryker) to verify that the unit tests properly cover the library's functionality.

Functions should have the lowest possible complexity. If you have several nested conditionals, try to refactor to multiple smaller functions.

Function names should be descriptive and use camelCase. Aim for specificity in function names.

Prefix a binding with an underscore to mark it as deliberately unused; lint ignores `_`-prefixed
parameters, variables and caught errors. This is mainly for parameters that exist to satisfy a
callback signature, such as the `rng` argument on DCC occupation `apply` handlers, where dropping
the parameter would hide the contract the callback is written against.

Avoid `any`. Where a value is genuinely untyped at a boundary, describe its shape with a type
instead. Deliberately invalid test fixtures should go through `as unknown as T`, which states the
intent rather than disabling checking.

Prefer a targeted `eslint-disable-next-line` with a comment explaining why over relaxing a rule
project-wide. A rule is only turned off in `eslint.config.js` when it does not fit the project at
all, and each of those carries a comment saying why.

Regarding file names and directory names, use snake_case always, except for component names which should be PascalCase.

## Dependencies

Avoid introducing new dependencies unless absolutely necessary. Prefer existing dependencies over new ones.

For random number generation, always use [`@ironarachne/rng`](https://www.npmjs.com/package/@ironarachne/rng).
