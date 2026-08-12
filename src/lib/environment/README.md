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

const config = getDefaultConfig();
config.rng = rng;
config.latitude = 55;
config.elevation = 1200;
config.erosionIterations = 4;
config.climateConfig = { ...config.climateConfig /* ... */ };

const environment = generate(config);
```

The config carries the `RNG` along with the physical inputs — latitude, elevation, relief energy,
terrain and water vectors, erosion settings — plus one config per sub-generator.

## Status

`Ecosystems.generate` is currently a stub returning an empty ecosystem; the other four
sub-generators are implemented.
