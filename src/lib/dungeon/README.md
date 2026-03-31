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

## Example Usage

```typescript
import { generateDungeon } from '$lib/dungeon';
import type Environment from '$lib/environment/environment';

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

## Testing / Visualizing in Terminal Tools

If you are developing inside this library, there are utility scripts mapped via `package.json` to draw your logic mathematically utilizing unicode terminals!

```bash
# Renders a single room shape
npm run render:room "your-seed" 15 10 blob

# Renders a complete generated Layout grid showing
# halls, doors, locked secrets, and distributed keys
npm run render:layout "seed2" 50 30 0.25 "rectangle,circle"
```
