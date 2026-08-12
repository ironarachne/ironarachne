# Archetypes

This library defines the `Archetype` type — a character's role or calling, bundling the abilities,
combat actions, magic profile, and equipment it implies — and ships the fantasy archetype tables
built on it.

An archetype is the reusable half of a character concept: "knight" or "hedge witch" carries a power
modifier, a set of abilities and actions, optional caster profile, and rules for what such a person
is likely to be carrying. Generators combine one with a species, culture, and name to make a
character.

## Features

- **`Archetype`** — a `TaggedItem` with `name`, `description`, `basePowerModifier`, `abilities`,
  `actions`, an optional `casterProfile`, `equipmentGenerationConfigs`, and `addedTags`/
  `removedTags` for adjusting the tags of whatever the archetype is applied to.
- **Fantasy tables** — `getAllFantasyArchetypes`, split into `getFantasyCombatArchetypes` and
  `getFantasyNonCombatArchetypes`.
- **Lookup** — `getArchetypeByName`.

## Usage

```typescript
import {
  getAllFantasyArchetypes,
  getArchetypeByName,
  getFantasyCombatArchetypes,
} from '$lib/archetypes';

const archetypes = getAllFantasyArchetypes();
const knight = getArchetypeByName('knight', archetypes);

// Only the ones who fight for a living
const fighters = getFantasyCombatArchetypes();
```

Because an `Archetype` is tagged, a list of them narrows with the standard tag filter:

```typescript
import { applyTagFilter } from '$lib/tags';

const casters = applyTagFilter(getAllFantasyArchetypes(), { includeAllTags: ['magic'] });
```
