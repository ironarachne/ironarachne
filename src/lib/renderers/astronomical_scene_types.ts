/**
 * The scene: plain data describing what an astronomical preview contains, and nothing about how to
 * draw it. Both the Canvas2D and the WebGL backend consume this, so neither computes anything the
 * other might compute differently.
 *
 * These types are the "The scene" class diagram in `docs/renderers.md`. That document is the
 * authority: if an implementation needs a shape the diagram does not have, amend the diagram first.
 */

import type { RGBColor } from '$lib/graphics';

/**
 * How much work a backend should do. `reduced` renders at half linear scale and drops the
 * bump-normal pass; it applies to both backends, because a weak GPU and a weak CPU both benefit.
 * The scene carries the decision; acting on it belongs to the backends.
 */
export type RenderQuality = 'full' | 'reduced';

/**
 * One background star, carried as a position rather than as a count to be re-rolled. That is what
 * makes the two backends identical rather than merely similar, and it removes the RNG-ordering
 * hazard that made the same seed draw different rings on each backend.
 */
export type BackgroundStar = {
  x: number;
  y: number;
  radiusPx: number;
  alpha: number;
};

export type SceneBackground = {
  fillColor: string;
  stars: BackgroundStar[];
};

export type PlanetPalette = {
  main: RGBColor;
  band1: RGBColor;
  band2: RGBColor;
};

export type PlanetShading = {
  seedFloat: number;
  lightDir: [number, number, number];
  cloudCoverage: number;
  stormActivity: number;
};

export type SceneRing = {
  angleRad: number;
  tilt: number;
  color: RGBColor;
};

/**
 * The fields every body has. This is a spelling device, not a concept: a TypeScript union cannot
 * declare shared members for its variants to inherit, so the base is intersected into each variant
 * and the union is taken over the results. It is deliberately not exported and deliberately not a
 * box in the diagram — it has no meaning apart from the two variants that use it.
 */
type SceneBodyBase = {
  centerX: number;
  centerY: number;
  radiusPx: number;
};

export type SceneStar = SceneBodyBase & {
  kind: 'star';
  photosphere: RGBColor;
  corona: RGBColor;
  glow: RGBColor;
  coronaWidthPx: number;
  /**
   * Rotates the shader's plasma convection and corona flares, the way `PlanetShading.seedFloat`
   * rotates a planet's banding. A star's *colours* follow from its surface temperature and need no
   * seed, which is what the design document meant in saying stars need none; its surface detail
   * does, and the WebGL backend used to draw that number itself from whichever RNG was to hand.
   * The Canvas2D backend has no surface detail to rotate and ignores this.
   */
  seedFloat: number;
};

export type ScenePlanet = SceneBodyBase & {
  kind: 'planet';
  classification: string;
  /**
   * Resolved once here rather than re-derived by each backend from `classification`, which is how
   * the WebGL path came to hand gas-giant colours to terrestrial planets.
   */
  isGasGiant: boolean;
  palette: PlanetPalette;
  shading: PlanetShading;
  ring?: SceneRing;
};

/** `kind` is the discriminant. */
export type SceneBody = SceneStar | ScenePlanet;

/**
 * Note what is absent: there is no star-system type. A system's layout resolves to absolute
 * positions inside the builder and does not survive into the scene. A backend that could see the
 * unit arithmetic would be able to do its own arithmetic with it, which is how the two backends
 * drifted apart in the first place.
 */
export type AstronomicalScene = {
  width: number;
  height: number;
  seed: string;
  quality: RenderQuality;
  background: SceneBackground;
  bodies: SceneBody[];
};
