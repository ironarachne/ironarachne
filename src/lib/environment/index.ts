export type { default as Environment } from './environment';
export type { default as EnvironmentGeneratorConfig } from './environment_generator_config';
export { default as PrecipitationType } from './precipitationtype';
export * from './environments';
// Every sub-library exports `generate` and `getDefaultConfig`, and `precipitationtypes` exports an
// `all` that `landforms` also has, so each is namespaced rather than starred — the way
// `environment/biomes/index.ts` already namespaces its classifications. `landforms` is starred
// because its own index already namespaces the table, so it arrives as `Landforms.all`.
export * as Biomes from './biomes';
export * as Climates from './climates';
export * as Ecosystems from './ecosystems';
export * from './landforms';
export * as PrecipitationTypes from './precipitationtypes';
export * as Terrain from './terrain';
export * as WaterSystems from './water_systems';
