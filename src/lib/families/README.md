# Families

This library generates a **family across several generations** — the people, who married whom, who
their children are — and can lay the result out as a family tree. Members are full `Character`s, and
the connections between them are `Relationship`s, so a generated family plugs into the rest of the
character machinery rather than being a separate model.

The generator models the awkward parts of real descent as options rather than assumptions: multiple
marriages, same-gender marriage, adoption, illegitimate children, cross-species marriage, infant
mortality, and fertility are all chances you set, and all default to something reasonable.

## Features

- **Types** — `Family` (id, name, head, members, relationships, and the name generators it was built
  with) and `FamilyGenerationConfig`.
- **Generation** — `generateNewFamily(seed, config)` with `getDefaultFamilyGenerationConfig(seed)`;
  `generateFamilyGeneration` builds a single generation for callers growing a family incrementally.
- **Graph** — `getFamilyGraph` returns the nodes and edges of the tree; `getFamilyTreeSVG` renders
  it directly to an SVG string.

## Usage

```typescript
import {
  generateNewFamily,
  getDefaultFamilyGenerationConfig,
  getFamilyTreeSVG,
} from '$lib/families';

const seed = 'some seed';
const config = getDefaultFamilyGenerationConfig(seed);
config.generations = 4;

const family = generateNewFamily(seed, config);

family.members.length;
const svg = getFamilyTreeSVG(family);
```

Shape the family through the config's chances (each 0–1):

```typescript
const config = getDefaultFamilyGenerationConfig(seed);
config.minMembersPerGeneration = 2;
config.maxMembersPerGeneration = 6;
config.allowAdoption = true;
config.adoptionChance = 0.1;
config.infantMortalityChance = 0.2; // a harsher setting
```

To work with the structure rather than the picture, use the graph:

```typescript
import { getFamilyGraph } from '$lib/families';

const graph = getFamilyGraph(family);
```

Members carry a `familyId`, so a character generated as part of a family can be traced back to it.
