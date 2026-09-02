# Environment

This library generates a **physical environment** — the natural setting of a place — by combining
five sub-generators that each own one aspect of it:

| Sub-library      | What it decides                                              |
| ---------------- | ------------------------------------------------------------ |
| `climates/`      | Temperature and precipitation regime, and the climate's name |
| `biomes/`        | The biome classification and its features                    |
| `terrain/`       | Elevation, slope, and erosion                                |
| `water_systems/` | Rivers, lakes, and how water moves through the place         |
| `ecosystems/`    | The living communities the above support                     |

`landforms` and `precipitationtypes` are shared tables the sub-generators draw on. Each sub-library
exports `generate` and `getDefaultConfig`, which is why the index namespaces them
(`Biomes.generate`, `Climates.generate`) rather than starring them — the names would collide.

## Features

- **Types** — `Environment` (biome, climate, terrain, water system, dominant ecosystem, all
  ecosystems, description), `EnvironmentGeneratorConfig`, and `PrecipitationType`.
- **Generation** — `generate` from a full config, or `generateForClimate(climateName, rng)` when you
  know the climate you want and are happy for the rest to follow from it.
- **Description** — `describeTerrain`, `getDirectionOfSlope`, and `getStrengthOfSlope`.
- **Sub-generators** — `Biomes`, `Climates`, `Ecosystems`, `Terrain`, `WaterSystems`, and
  `PrecipitationTypes`, each namespaced; `Landforms.all()` arrives through the starred
  `./landforms`.
- **Weather events** — `PrecipitationTypes.getRandomWeatherEvents`, used by
  [`$lib/weather`](../weather/README.md).

## The artifact kind

The five modules the readiness pass gives every Release-ready tool
([docs/tool-readiness.md](../../../docs/tool-readiness.md)), flat at the library root beside the
sub-libraries:

- **`environment_roll.ts`** — the one path from a seed to an environment, taken by the generator
  page and by a re-roll from provenance. `EnvironmentGeneratorConfigRecord` is the eleven physical
  inputs the page offers and nothing else; the four sub-configs are not recorded, because `generate`
  overwrites every field of them it uses. `randomEnvironmentGeneratorConfig` draws the
  "Randomize Parameters" numbers from a stream of their own, so pressing that button does not move
  what the seed produces.
- **`environment_snapshot.ts`** — writing an environment for storage and reading it back, both
  halves in one file because reading pulls nothing heavy. `dominantEcosystem` is not stored: it is
  `ecosystems[0]`, and storing both would write the same ecosystem twice.
- **`environment_artifact_kind.ts`** — kind `environment`, payload version 1, with the validator and
  the migration stub. A saved environment is named by its biome and climate, because an environment
  has no name of its own.
- **`environment_editing.ts`** — pure snapshot-to-snapshot field edits, grouped by the part they
  belong to and keyed by a field union. Nothing recomputes: raising a biome's temperature does not
  reclassify it, and moving the terrain's slope does not re-erode it.
- **`environment_presentation.ts`** — the environment as a document of titled sections, empty ones
  dropped, written once as Markdown and once as plain text for the PDF. It is also what the
  generator page renders, so what a referee reads on screen and what they take away cannot drift.

### The RNG is a parameter, not a default

`getDefaultConfig` here and in each of the four sub-libraries takes the `RNG` the caller is
generating from. It used to default to `new RNG(Date.now())`. Every caller overwrote it on the next
line, so the clock never actually reached a generated environment — what the default did was make
the helper look like a source of randomness a caller could safely forget about, which is
[decision 1](../../../docs/tool-readiness.md) of the readiness pass and was true of fifteen helpers
across six libraries.

## Usage

```typescript
import { generateForClimate } from '$lib/environment';

const environment = generateForClimate('temperate', rng);

environment.biome.name;
environment.description;
```

For full control, build a config and hand it in:

```typescript
import { Climates, generate, getDefaultConfig } from '$lib/environment';

const config = getDefaultConfig(rng);
config.latitude = 55;
config.elevation = 1200;
config.erosionIterations = 4;
config.climateConfig = { ...config.climateConfig /* ... */ };

const environment = generate(config);
```

The config carries the `RNG` along with the physical inputs — latitude, elevation, relief energy,
terrain and water vectors, erosion settings — plus one config per sub-generator.

Most callers want `rollEnvironment` instead, which takes a seed and the eleven physical inputs and
builds the config for you — it is the path the generator page and a re-roll from provenance both
take:

```typescript
import { rollEnvironment, toEnvironmentSnapshot } from '$lib/environment';

const environment = rollEnvironment('seed-xyz', { latitude: 55 /* ... */ });
const payload = toEnvironmentSnapshot(environment); // what the vault stores
```

## Status

`Ecosystems.generate` is currently a stub returning an empty ecosystem; the other four
sub-generators are implemented. That stub is why the presentation drops its Ecosystem section and
why the editor has no ecosystem fields: every environment this build makes carries one nameless
ecosystem with no flora and no fauna, and a section over it would be an empty heading on every
sheet ever exported. Both are written to fill themselves in when the sub-generator is.
