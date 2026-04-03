# Terrain Library

This library provides functional generators and data structures for creating geographical terrains. A "terrain" in this context represents a localized section of the ground with specific elevation ranges, relief energy (roughness), vector tilts, and geological materials.

## Architectural Principles

- **Purely Functional**: Terrain generation is done via pure functions, returning entire new objects.
- **Seeded Randomness**: Uses `@ironarachne/rng` inside configurations to generate deterministic topsoils, base bedrocks, and relief energy values.

## Core Types

- `Terrain`: The primary data structure representing a parcel of land. Includes `elevationMin`, `elevationMax`, `reliefEnergy`, `normalVector` (the "tilt" of the plane), a list of `landforms`, and its `geologicalMakeup`.
- `TerrainGeneratorConfig`: Configuration parameters used to generate a terrain deterministically. Requires parameters like `erosionIterations` and a `rng` seed instance.
- `GeologicalMakeup`: Contains `soilTypes` (e.g., loam, sand, gravel) and `rockTypes` (e.g., granite, sandstone, basalt) that establish the primary surface materials found within the terrain.

## Main Functions

- `generate(config: TerrainGeneratorConfig): Terrain`: Deterministically computes a new terrain based on the configured constraints, assigns random soil and bedrock combinations, applies initial erosion steps, and returns the finished data structure.
- `getDefaultConfig(): TerrainGeneratorConfig`: Returns a baseline parameter set and a current timestamp-seeded `RNG` instance, suitable for quick out-of-the-box generation.
- `erode(terrain: Terrain, strength: number): Terrain`: Simulates pure geometric erosion over the terrain by the given uniform strength, effectively wearing down extreme elevations and relief energy. Returns a freshly mutated instance.
