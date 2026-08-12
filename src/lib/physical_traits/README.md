# Physical traits

This library defines the **`PhysicalTrait`** type — a distinguishing feature of a body, in a
category, with tags — and generates one from a config. Scars, hair, eye colour, build, and markings
are all traits; what a species can have is decided by that species, not here.

## Features

- **`PhysicalTrait`** — `name`, `description`, `category`, and `tags`.
- **`PhysicalTraitGeneratorConfig`** — one trait's `name`, `category`, `tags`, and the `options` its
  description is drawn from ("green" + "eyes").
- **`generate`** — build a trait from a config using an `RNG`.
- **`add_trait`** — add a trait to a list, **replacing** any existing trait in the same category and
  returning a new list. Categories are single-valued: a creature has one eye colour, not three.

## Usage

```typescript
import { generate, type PhysicalTrait } from '$lib/physical_traits';

const trait: PhysicalTrait = generate(config, rng);
trait.description; // the sentence that ends up in a character description
```

Creature and character generation reads its trait options from the species being generated, so a
species is where a new trait belongs. `CharacterGenerationConfig.physicalTraitOverrides` bypasses
that when a caller needs a specific set.
