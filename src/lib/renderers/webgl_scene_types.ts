/**
 * What the WebGL backend draws, as plain data.
 *
 * A draw list is the WebGL counterpart of the sequence of context calls the Canvas2D backend
 * issues, and it exists for the same reason: everything the backend decides is then a value that a
 * test can look at without a GL context. The list is in back-to-front order, exactly as
 * `drawScene` walks the scene.
 */

import type * as THREE from 'three';

/** Uniforms as three's `ShaderMaterial` takes them: a name against a boxed value. */
export type ShaderUniforms = Record<string, { value: number | THREE.Vector2 | THREE.Vector3 }>;

/**
 * `normal` covers a body that occludes what is behind it, `additive` one that only adds light —
 * a star's corona over the sky.
 */
export type PlaneBlending = 'normal' | 'additive';

/**
 * A textured quad. `widthPx`/`heightPx` are also the `resolution` its shader converts UVs with, so
 * the plane is the shader's whole coordinate system and must be large enough to hold everything
 * the shader draws.
 *
 * `centerX`/`centerY` are in the renderer's pixel space, whose y axis points **up** — the scene's
 * points down, and the builder is where that flip happens.
 */
export type WebGLPlaneItem = {
  kind: 'plane';
  widthPx: number;
  heightPx: number;
  centerX: number;
  centerY: number;
  fragmentShader: string;
  uniforms: ShaderUniforms;
  blending: PlaneBlending;
};

/**
 * The background starfield, as one point sprite per star. The arrays are parallel and are handed
 * to three as buffer attributes; there is only one points shader, so unlike a plane this item does
 * not name one.
 */
export type WebGLPointsItem = {
  kind: 'points';
  /** Three components per star, y already flipped. */
  positions: Float32Array;
  radii: Float32Array;
  alphas: Float32Array;
  color: THREE.Vector3;
};

export type WebGLDrawItem = WebGLPlaneItem | WebGLPointsItem;
