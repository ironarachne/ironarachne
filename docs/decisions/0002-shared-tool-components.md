# 0002. Share tool components across routes and workshop panels

**Status:** Accepted

## Context

People reach tools through standalone URLs and through the workshop. Keeping a separate
implementation for each surface would duplicate controls and behavior. Eagerly importing all
tools would make opening one panel load unrelated generation, rendering, and export code.
See the [workshop route design](../workshop.md#routes) and
[panel registry rationale](../../src/lib/workshop/README.md).

## Decision

Use the tool's catalog path as the shared key. A standalone route mounts the tool's Svelte
component, and the workshop resolves the same component through a panel registry with literal
dynamic import specifiers. The catalog supplies discovery metadata.

## Consequences

A tool change reaches both surfaces. Verify the component in each context. A new tool needs a
catalog entry and a panel loader, and tests check that the sets of paths match. Literal
specifiers let the bundler split the code for each tool. See the
[registry](../../src/lib/workshop/tool_panels.ts) and
[agreement test](../../src/lib/workshop/tool_panels.test.ts).
