import type RGBColor from '$lib/graphics/rgb_color';

/**
 * The colour of a background star, for both backends.
 *
 * The scene carries a star's position, radius and alpha but not its colour, so there is one colour
 * and it lives here. The three renderers each had their own slightly different blue-white before
 * (200,210,240 / 210,220,250 / 220,230,255); this is the middle one.
 */
export const BACKGROUND_STAR_COLOR: RGBColor = { r: 210 / 255, g: 220 / 255, b: 250 / 255 };
