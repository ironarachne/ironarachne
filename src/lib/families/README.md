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

## Saving a family

The generator is Release-ready (issue #55), which means a rolled family can be kept:

- `family_snapshot.ts` — the stored form. **The payload is the graph, and it is flat**: members
  as `StoredCharacter` (from `$lib/characters`), edges as id records, and the two name generators
  as pattern sources. Nothing refers to another object directly, so the cycles a family contains
  by construction never reach `structuredClone`; the graph is only a graph once `graph.ts` builds
  it.
- `family_rehydrate.ts` — the stored form back into a `Family`. Members are rebuilt by
  `$lib/characters`; the generators are rebuilt from their patterns and the RNG the codec is
  handed, as a culture's are.
- `family_artifact_kind.ts` — the `family` kind. Each member is validated by the character kind's
  own validator rather than a copy. An edge to a member who is gone is accepted: the readers below
  answer nothing for it, which is the well-defined result.
- `family_relations.ts` — `familyMateOf`, `familyChildrenOf`, `familyParentsOf`, the edge readers
  the page, the editor and the export share. They tolerate dangling ids.
- `family_roll.ts` — the single path from a seed and every control on the page to a family, names
  included, and the provenance record a re-roll reads back. A species or name set this build no
  longer has is substituted and reported.
- `family_editing.ts` — the family's name and each member's first and last name (the display name
  follows), and removing a member with their edges.
- `family_presentation.ts` — the roster as a document, and the Markdown and PDF exports written
  from it. The tree `getFamilyTreeSVG` has always drawn is offered as an SVG download beside them.

The family can be named from a saved culture in the open project, recorded as an artifact
reference (5.1). `Family` has no arms field, so the heraldry reference the design describes waits
on one.

This tool implements no game system, so there is no edition to name.
