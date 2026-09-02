# Dungeon Generation Library

This library handles the procedural generation of grid-based dungeons and structures, heavily inspired by "roguelike" generation algorithms.

It maps geometry, enforces mathematical topology (such as guarantees that keys are accessible _before_ the locked door they match), and populates the resultant space using `Iron Arachne`'s encounter, treasure, and biome ecosystems.

## Subsystems

The generator operates progressively through isolated procedural subsystems to achieve a complete, populated map:

### 1. Grid (`/grid`)

The foundational mathematical and state layer. Rather than heavily nested arrays (`[][]`), this uses a functionally pure 1D array type mapped natively to 2D geometry for extreme lookup speed. It handles boundaries, tiles, adjacency fetching (neighbors/diagonals), and grid mutation.

### 2. Room Primitives (`/room`)

A builder responsible for creating raw geometric zones without localized context. Supported styles include:

- `rectangle`: A solid block of floor.
- `circle`: An elliptically carved zone.
- `l-shape`: A rigid cornered carving.
- `blob`: A sprawling "drunken walk" cellular automaton shape.

### 3. Layout Architect (`/layout`)

Responsible for dropping rooms spatially onto the master grid map.

- **`architect.ts`**: The core packing engine that prevents rooms from overlapping and maps structure around a configurable density percentage.
- **`corridors.ts`**: Implements a graphical Minimum Spanning Tree traversal utilizing dogleg L-shaped connections. It verifies the map is a single interconnected piece (no disconnected orphan islands), while adding minor connective loops to prevent overly linear backtracking.

### 4. Interactive State (`/interactive`)

Controls the functional mechanics of traversal.

- **`doors.ts`**: Sweeps room boundaries to detect valid horizontal and vertical architectural chokepoints between rooms and halls, optionally converting them to standard, locked, or secret doors.
- **`keys.ts`**: Uses a simulated Breadth-First-Search (BFS) "Zone" expansion. It ensures that whenever a locked door blocks a main pathway, the unique key required is always mathematically populated inside the immediately accessible zone _before_ that door in the graph. Prevents soft-locks!

### 5. Theme Configuration (`/theme`)

Bridges random geometric architecture to logical flavor using the external `environment/environment.ts` library. Connects a natural environment (e.g. `Forest`) to an architectural Blueprint (e.g. `Stronghold`, `Tomb`), dictating the size, allowed room shapes, and generating tags for external population libraries.

### 6. Generator / Orchestrator (`/generator`)

The top-level exported macro-factory. When provided a root layout size, an Environment, and a Blueprint strategy:

1. It creates the map boundaries.
2. Sprinkles the room primitives & connects hallways.
3. Locks the chokepoints and scatters the keys.
4. Uses `Encounter` and `Treasure` libraries to inject native combat groupings and local loot into valid rooms depending on the themes.
5. Emits the master `EngineeredDungeon` output.

### 7. The artifact kind (library root)

The six modules the readiness pass gives every Release-ready tool (docs/tool-readiness.md), sitting
flat at the library root rather than in a subdirectory of their own — they are the library's public
face, where the seven subsystems above are how it works inside.

- **`dungeon_roll.ts`**: the one path from a seed to a dungeon, taken by the generator page and by
  a re-roll from provenance. It owns the environment step — biome forcing, latitude, terrain
  vectors — that used to live in `DungeonGenerator.svelte`, which is why a re-roll can now
  reproduce what was rolled. `withEncounterAtEntrance` is the composition half: a saved encounter
  placed in the room the stairs come up in.
- **`dungeon_snapshot.ts`** / **`dungeon_rehydrate.ts`**: writing a dungeon for storage and reading
  it back. The payload is the blueprint — grid, layout, rooms, doors, keys, entrances, theme — and
  never the drawing. The two halves are split because reading rebuilds every room's encounter and
  reaches the archetype tables and the charge art through it; writing, listing and validating reach
  none of that.
- **`dungeon_artifact_kind.ts`**: kind `dungeon`, payload version 1, with the validator and the
  migration stub. Metadata and validation only; the codec is a dynamic import.
- **`dungeon_editing.ts`**: pure snapshot-to-snapshot field edits — the dungeon's name and
  blueprint, and per room the name, purpose, description, encounter, combatants, treasure and keys.
  The geometry is deliberately not editable: the layout is what makes the map drawable and the key
  placement reachable.
- **`dungeon_presentation.ts`**: the dungeon as a document of titled sections, empty ones dropped,
  written once as Markdown and once as plain text for the PDF.

### On payload size

A live `EngineeredDungeon` is very large, because every combatant in every room's encounter embeds
a whole `Species`. Measured at four sizes: 1.2 MB at 20×20, 6.8 MB at the page's default 40×60,
14 MB at 60×60 with encounters in most rooms, and 48 MB at the 120×120 maximum with an encounter
and treasure in every one.

The snapshot is one to two orders of magnitude smaller — 64 KB, 304 KB, 700 KB and 2.7 MB for the
same four — because `toEncounterSnapshot` converts each mob to the stored vocabulary, which carries
a species _name_ and rebuilds the species on read. That conversion is the reason a dungeon is
storable at all, and `dungeon_snapshot.test.ts` pins the ratio so a change that puts a whole
`Species` back into a payload fails there rather than in somebody's quota warning. The generator
page shows the figure beside the save control.

## Example Usage

```typescript
import { generateDungeon } from '$lib/dungeon';
import type { Environment } from '$lib/environment';

const environment: Environment = {
  /* ... pulled from $lib/environment/environments ... */
};

const dungeon = generateDungeon({
  seed: 'seed-xyz',
  width: 60,
  height: 60,
  environment: environment,
  blueprintName: 'Tomb', // Matches any valid name in Blueprint array
  encounterChancePerRoom: 0.4,
  treasureChancePerRoom: 0.3,
});

// Use dungeon.layout.grid to render your maps
// Access dungeon.rooms[X].encounter to see spawned monsters!
```

Most callers want `rollDungeon` instead, which takes a seed and the page's own settings and builds
the environment for you — it is the path the generator and a re-roll from provenance both take:

```typescript
import { rollDungeon, toDungeonSnapshot } from '$lib/dungeon';

const dungeon = rollDungeon('seed-xyz', { width: 60, height: 60, blueprintName: 'Tomb' });
const payload = toDungeonSnapshot(dungeon); // what the vault stores
```

## Testing / Visualizing in Terminal Tools

If you are developing inside this library, there are utility scripts mapped via `package.json` to draw your logic mathematically utilizing unicode terminals!

```bash
# Renders a single room shape
npm run render:room "your-seed" 15 10 blob

# Renders a complete generated Layout grid showing
# halls, doors, locked secrets, and distributed keys
npm run render:layout "seed2" 50 30 0.25 "rectangle,circle"
```
