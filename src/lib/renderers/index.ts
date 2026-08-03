// The render entry points in `astronomical_preview.ts` are deliberately absent. They statically
// import `three` and the GLSL shader modules, so re-exporting them here would put the whole WebGL
// graph in the import chain of anything that wanted only the pure scene builder. Import them from
// '$lib/renderers/astronomical_preview' instead — the same reasoning `$lib/workshop` applies to
// its panel loaders.
export * from './astronomical_renderer_kind';
export * from './astronomical_renderer_storage';
export * from './astronomical_scene';
export type * from './astronomical_scene_types';
