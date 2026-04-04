# Climates
This library handles the generation and classification of climates. A climate represents the long-term pattern of weather in a particular area, including temperature, precipitation, humidity, wind, and seasonal changes.

## Files
- `climates.ts`: Contains the main generator function (`generate`) and other functions relating to computing a climate's properties (temperature ranges, wind vectors, precipitation, humidity), seasons, and descriptions.
- `climate_types.ts`: TypeScript definition forms for data structures used by the climate generation library (`Climate`, `Season`, `ClimateType`, and `ClimateGeneratorConfig`).
- `index.ts`: The main entry point to load functions or types for climates.

## Usage
Like other generation libraries in Iron Arachne, `generate` relies on a configuration object (`ClimateGeneratorConfig`) that includes an instance of `@ironarachne/rng` to guarantee deterministic, seed-based outputs. No classes or mutations are used in the public API.
