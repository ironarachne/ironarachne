// The render entry points in `astronomical_preview.ts` are deliberately absent. They statically
// import `three` and the GLSL shader modules, so re-exporting them here would put the whole WebGL
// graph in the import chain of anything that wanted only the pure scene builder. Import them from
// '$lib/renderers/astronomical_preview' instead — the same reasoning `$lib/workshop` applies to
// its panel loaders.
//
// `renderer_decision.ts` is absent for the same reason: it reaches the probe, which is DOM, and the
// settings UI that wants it can say so by importing it directly.
export * from './astronomical_scene';
// The SVG writer belongs here rather than beside the render entry points: it takes a scene and
// returns a string, touching neither `three` nor the DOM, so anything that can build a scene can
// write one out.
export * from './svg_scene_draw';
export type * from './astronomical_scene_types';
export * from './renderer_backend';
export * from './renderer_preference_storage';
export type * from './renderer_decision_types';
