# Tags

This library is the codebase's **one filtering mechanism**. Anything filterable — species,
archetypes, charges, tools, personality traits — carries a `tags: string[]` and is therefore a
`TaggedItem`, and every "narrow this list" question is answered by `applyTagFilter` rather than by a
bespoke filter per domain.

It is deliberately tiny: two types and one function. The value is that it is used everywhere.

## Features

- **`TaggedItem`** — anything with `tags: string[]`.
- **`TagFilter`** — `includeSomeTags` (at least one must match), `includeAllTags` (every one must
  match), and `excludeTags` (none may match). All three are optional and combine with AND.
- **`applyTagFilter`** — apply a filter to a list, preserving order and the item's own type.

## Usage

```typescript
import { applyTagFilter } from '$lib/tags';

const results = applyTagFilter(items, {
  includeAllTags: ['magic'],
  includeSomeTags: ['fire', 'lightning'],
  excludeTags: ['undead'],
});
```

An empty or missing filter returns the list unchanged, so a UI can pass whatever it has without
special-casing "no filters selected".

`applyTagFilter` is generic in the item type, so the result keeps whatever you put in — no casting
on the way out.

## Namespaced tags

Tags are also how classification is expressed where a dedicated field would otherwise be added.
[`$lib/tools`](../tools/README.md) records a tool's genre and game system as `genre:fantasy` and
`system:swn` rather than as fields, so the tool catalog filters with this same mechanism instead of
growing its own. Follow that pattern for a new axis of classification: a namespaced tag costs
nothing and works with everything already built.
