# Iron Arachne Development Guidelines

You are an expert TypeScript developer assisting with "Iron Arachne," a suite of procedural generation tools.

## 1. Architectural Constraints
* **Paradigm:** Strictly Functional Programming. 
* **No Classes:** Do not use `class`, `constructor`, `this`, or `private/public` modifiers.
* **Data Structures:** Use `type` or `interface` for data definitions, and prefer `type`.
* **Logic:** Use pure functions and composition. 
* **State Management:** Leverage Svelte's reactive stores or simple functional state transforms.
* **No Backend:** All code must run in the browser. Do not suggest any server-side or Node.js-specific APIs.
* **Specific Random Number Generation:** Use the `@ironarachne/rng` library for all random number generation to ensure consistency across generators. Do not suggest other libraries for this purpose. Generally, functions that do random number generation should accept a `seed` string parameter and instantiate a local instance of the `RNG` class from `@ironarachne/rng` to ensure reproducibility.
* **No External APIs:** Do not suggest using any external APIs or services. All functionality must be implemented within the codebase using TypeScript and the specified libraries. The exception to this is scripts that are used for development purposes, such as build scripts or code generation scripts, which may use Node.js APIs but should not be part of the main library code.

## 2. Tech Stack & Tooling
* **Frameworks:** Svelte + Vite.
* **Language:** TypeScript (Strict mode).
* **Formatting:** You MUST adhere to the rules defined in the `.editorconfig` file. Do not suggest formatting that conflicts with these settings.
* **Directory Structure:** Domain-specific libraries go in a subdirectory named for the domain in `src/lib` (e.g., `src/lib/maze`, `src/lib/heightmap`). Avoid "kitchen sink" libraries that mix unrelated functionality.
* **File Names:** Use snake_case for file names. Always use `.ts` extension for TypeScript files, even if they contain only types or interfaces. Avoid using `.tsx` since we are not using React.
* **CLI Scripts:** Use `vite-node` for all CLI scripts.

## 3. Coding Style
* **Immutability:** Prefer `const`. Avoid `let` where possible.
* **Naming:** Use descriptive names for generators and transformers. Where a function might be ambiguous, add a prefix or suffix to clarify its purpose (e.g., `generateMaze`, `transformHeightmap`).
* **Documentation:** Use TSDoc for functions. Keep comments concise and meaningful. Every library directory should have a README.md explaining the purpose of the library and its main functions.
* **Imports:** Use explicit file extensions if required by the Vite configuration.
* **Tests:** Write unit tests for all generators and library functions. Test files should live alongside the implementation files with a `.test.ts` suffix (e.g., `mazeGenerator.test.ts`). All tests use vitest.

## 4. Procedural Generation Principles
* Focus on reproducibility and seed-based randomness.
* Keep algorithms performant and memory-efficient.
* Ensure that generators are composable, allowing users to build complex content from simpler building blocks.
* Avoid side effects in generator functions. They should return new data structures rather than modifying existing ones.
