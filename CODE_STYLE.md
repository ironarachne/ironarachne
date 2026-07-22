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

Components are Svelte code. Each component should have its own directory in `src/components`. Tests are not necessary for components.

## Coding Rules

Always use a functional style. Avoid classes. Use typescript types to describe objects and interfaces.

Group related code together within a library or component. Types should exist separately from their usage files. For example, if you have a `ShinyObject` type, the type definition should be in a file `src/lib/shiny-objects/shiny-object-types.ts`and functions for working with that type should be in a file `src/lib/shiny-objects/shiny-objects.ts`. Export functions that may be accessed from outside the library or component.

Write unit tests for all libraries. Use mutation testing (via stryker) to verify that the unit tests properly cover the library's functionality.

Functions should have the lowest possible complexity. If you have several nested conditionals, try to refactor to multiple smaller functions.
