# Abilities

This library defines the `Ability` type — a named, described, categorized capability that a
creature, species, or archetype can have — and the helpers for looking one up in a list. It holds
no ability data of its own; the tables live with the things that own them (archetypes, species,
monsters), and this library gives them a shared shape.

An `Ability` is a `TaggedItem`, so a list of abilities filters with the same `applyTagFilter`
everything else in the codebase uses.

## Features

- **`Ability`** — `name`, `description`, `category`, an optional `threatLevel` for the rough power
  tier used by species stat blocks, plus the `tags` inherited from `TaggedItem`.
- **`getAbilityByName`** — find an ability in a list by name.

## Usage

```typescript
import { getAbilityByName, type Ability } from '$lib/abilities';

const abilities: Ability[] = [
  {
    name: 'Darkvision',
    description: 'Can see in the dark up to 60 feet.',
    category: 'senses',
    tags: ['sense', 'passive'],
  },
];

const darkvision = getAbilityByName('Darkvision', abilities);
```

`getAbilityByName` throws when no ability matches, so treat a miss as a bug in the caller's data
rather than an expected outcome.
