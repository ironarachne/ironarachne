# Water Systems

This library handles the generation and classification of water systems (e.g., oceans, large lakes). A water system manages local currents, surface level, and surface temperature.

## Files

- `water_systems.ts`: Contains the main generator function (`generate`) and logic relating to calculating current/temperature modifiers based on latitude.
- `water_system_types.ts`: TypeScript definitions for the water system structures (`WaterSystem`, `WaterSystemGeneratorConfig`).
- `index.ts`: The main entry point to load functions or types for the module.

## Usage

`generate` accepts a `WaterSystemGeneratorConfig` object containing an instance of `@ironarachne/rng`. This guarantees deterministic outputs based on the seed. No classes or direct `let` assignments are unnecessarily used, adhering to the functional methodology.
