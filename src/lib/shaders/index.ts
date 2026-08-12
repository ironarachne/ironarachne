// The planet shaders in `planets/planets.ts` are deliberately absent: they statically import the
// GLSL modules, so re-exporting them here would put every fragment shader in the import chain of
// anything that wanted only the `Shader` type. Import them from '$lib/shaders/planets/planets'
// instead, which is what `$lib/renderers/webgl_scene_build.ts` does — the same reasoning
// `$lib/renderers` applies to its own WebGL entry points.
export { createShader } from './shader';
export type { Shader } from './shader_types';
