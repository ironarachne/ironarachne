/**
 * The SVG writer: turns an {@link AstronomicalScene} into a standalone SVG document.
 *
 * **This is not a third backend, and it is deliberately not one.** `RendererBackend` stays
 * `'webgl' | 'canvas2d'`, and the decision machinery in `renderer_decision.ts` knows nothing about
 * this module. A backend answers "how does this machine draw a preview"; that question already has
 * an answer for every machine, because Canvas2D is the fallback and needs no GPU. What SVG answers
 * is a different question — "what can a user take away and print" — which is requirement 6.3, and
 * a file is not a backend.
 *
 * That distinction is also the honest reading of
 * [#17](https://github.com/ironarachne/ironarachne/issues/17), which asked for SVG *as a fallback*
 * "since the GLSL shader generation takes a reasonably powerful graphics card". That premise was
 * true when it was written and is not any more: #135 built the Canvas2D backend and the capability
 * probe that reaches for it, so a machine without a usable GPU already gets a picture. What was
 * still missing is a scalable one.
 *
 * It computes nothing, exactly as the Canvas2D backend computes nothing: every position, radius,
 * colour and angle was resolved by the scene builder. Where Canvas2D issues context calls, this
 * writes the same shapes as elements — the two radial gradients, the band overlay, the terminator
 * and the ring's two halves are each one SVG construct.
 */

import { darkenRgb, lightenRgb, rgbaCss, type RGBColor } from '$lib/graphics';

import { BACKGROUND_STAR_COLOR } from './astronomical/background_star_color';
import { ringBackHalfIsHalfZero, ringSemicircleAngles } from './astronomical/ring_geometry';
import type {
  AstronomicalScene,
  SceneBackground,
  SceneBody,
  ScenePlanet,
  SceneStar,
} from './astronomical_scene_types';

/** The band colours from pole to pole, as `canvas2d_planet_draw.ts` orders them. */
const GAS_GIANT_BAND_SEQUENCE = [
  'band1',
  'main',
  'band2',
  'main',
  'band1',
  'main',
  'band2',
] as const;

/** Numbers in an SVG attribute, trimmed: full float precision triples the file for no gain. */
function n(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : '0';
}

function color(value: RGBColor, alpha = 1): string {
  return rgbaCss(value, alpha);
}

/** Where the highlight sits — the same arithmetic, and the same two coordinate systems, as Canvas2D. */
function highlightPoint(planet: ScenePlanet): { x: number; y: number } {
  const [lightX, lightY] = planet.shading.lightDir;
  return {
    x: planet.centerX + planet.radiusPx * lightX * 0.8,
    y: planet.centerY - planet.radiusPx * lightY * 0.4,
  };
}

function backgroundElements(background: SceneBackground, width: number, height: number): string[] {
  return [
    `<rect width="${n(width)}" height="${n(height)}" fill="${background.fillColor}"/>`,
    ...background.stars.map(
      (star) =>
        `<circle cx="${n(star.x)}" cy="${n(star.y)}" r="${n(star.radiusPx)}" fill="${color(BACKGROUND_STAR_COLOR, star.alpha)}"/>`,
    ),
  ];
}

/**
 * A radial gradient in user space, which is what an SVG needs to reproduce a Canvas2D one.
 *
 * Canvas2D takes two circles; SVG takes a focal point and one circle. They agree when the inner
 * radius is zero, which is the surface gradient, and the terminator's non-zero inner radius is
 * approximated by moving its first stop out to the same fraction — the same falloff, one stop
 * later.
 */
function radialGradient(
  id: string,
  focus: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
  stops: { offset: number; color: string }[],
): string {
  const stopElements = stops
    .map((stop) => `<stop offset="${n(stop.offset)}" stop-color="${stop.color}"/>`)
    .join('');
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" fx="${n(focus.x)}" fy="${n(focus.y)}" cx="${n(center.x)}" cy="${n(center.y)}" r="${n(radius)}">${stopElements}</radialGradient>`;
}

function planetDefs(planet: ScenePlanet, index: number): string[] {
  const { centerX, centerY, radiusPx, palette, shading } = planet;
  const highlight = highlightPoint(planet);
  const center = { x: centerX, y: centerY };

  const defs = [
    radialGradient(`surface${index}`, highlight, center, radiusPx, [
      { offset: 0, color: color(lightenRgb(palette.main, 0.22)) },
      { offset: 0.55, color: color(palette.main) },
      { offset: 1, color: color(darkenRgb(palette.main, 0.42)) },
    ]),
    radialGradient(`terminator${index}`, highlight, center, radiusPx, [
      { offset: 0.35, color: 'rgba(0,0,0,0)' },
      { offset: 1, color: 'rgba(0,0,0,0.55)' },
    ]),
    `<clipPath id="disk${index}"><circle cx="${n(centerX)}" cy="${n(centerY)}" r="${n(radiusPx)}"/></clipPath>`,
  ];

  if (planet.isGasGiant) {
    const rotation = Math.floor((shading.seedFloat % 1) * GAS_GIANT_BAND_SEQUENCE.length);
    const stops = GAS_GIANT_BAND_SEQUENCE.map((_entry, position) => {
      const key = GAS_GIANT_BAND_SEQUENCE[(position + rotation) % GAS_GIANT_BAND_SEQUENCE.length];
      const offset = position / (GAS_GIANT_BAND_SEQUENCE.length - 1);
      return `<stop offset="${n(offset)}" stop-color="${color(palette[key])}"/>`;
    }).join('');
    defs.push(
      `<linearGradient id="bands${index}" gradientUnits="userSpaceOnUse" x1="${n(centerX)}" y1="${n(centerY - radiusPx)}" x2="${n(centerX)}" y2="${n(centerY + radiusPx)}">${stops}</linearGradient>`,
    );
  }

  return defs;
}

/**
 * One half of the projected ring, as an elliptical arc.
 *
 * The half to draw and its opacity come from the same two functions the Canvas2D path uses, so the
 * two agree on which half is behind the planet rather than each deciding for itself.
 */
function ringHalf(planet: ScenePlanet, phase: 'back' | 'front'): string {
  const ring = planet.ring;
  if (ring === undefined) {
    return '';
  }
  const { centerX, centerY, radiusPx } = planet;
  const rx = radiusPx * 2.4;
  const ry = Math.max(radiusPx * 0.22, radiusPx * ring.tilt);
  const oy = -radiusPx * 0.05;
  const band = Math.max(1, radiusPx * 0.07);

  const backIsHalfZero = ringBackHalfIsHalfZero(rx, ry, oy, ring.angleRad);
  const useFirstHalf = phase === 'back' ? backIsHalfZero : !backIsHalfZero;
  const { startAngle, endAngle } = ringSemicircleAngles(rx, ry, useFirstHalf);

  const point = (angle: number) => ({ x: rx * Math.cos(angle), y: oy + ry * Math.sin(angle) });
  const from = point(startAngle);
  const to = point(endAngle);
  // Canvas draws these counter-clockwise; an SVG arc says so with sweep-flag 0.
  const path = `M ${n(from.x)} ${n(from.y)} A ${n(rx)} ${n(ry)} 0 0 0 ${n(to.x)} ${n(to.y)}`;
  const alpha = phase === 'back' ? 0.35 : 0.75;
  const degrees = (ring.angleRad * 180) / Math.PI;

  return `<g transform="translate(${n(centerX)} ${n(centerY)}) rotate(${n(degrees)})"><path d="${path}" fill="none" stroke="${color(ring.color, alpha)}" stroke-width="${n(band)}" stroke-linecap="butt"/></g>`;
}

function planetElements(planet: ScenePlanet, index: number): string[] {
  const { centerX, centerY, radiusPx, shading } = planet;
  const disk = `cx="${n(centerX)}" cy="${n(centerY)}" r="${n(radiusPx)}"`;

  const elements = [ringHalf(planet, 'back'), `<circle ${disk} fill="url(#surface${index})"/>`];

  if (planet.isGasGiant) {
    const opacity = 0.25 + shading.stormActivity * 0.45;
    elements.push(
      `<g clip-path="url(#disk${index})"><rect x="${n(centerX - radiusPx)}" y="${n(centerY - radiusPx)}" width="${n(radiusPx * 2)}" height="${n(radiusPx * 2)}" fill="url(#bands${index})" opacity="${n(opacity)}"/></g>`,
    );
  }

  elements.push(`<circle ${disk} fill="url(#terminator${index})"/>`, ringHalf(planet, 'front'));
  return elements.filter((element) => element !== '');
}

/**
 * A star, drawn as its photosphere under a corona.
 *
 * Deliberately simpler than the Canvas2D star: this file exists so a planet can be exported as a
 * scalable image, and a star appears in it only because a scene may carry one. The shader's plasma
 * detail has no SVG equivalent that is not a raster image embedded in an SVG, which would defeat
 * the point of the format.
 */
function starDefsAndElements(star: SceneStar, index: number): { defs: string[]; body: string[] } {
  const outer = star.radiusPx + star.coronaWidthPx;
  const center = { x: star.centerX, y: star.centerY };
  return {
    defs: [
      radialGradient(`corona${index}`, center, center, outer, [
        { offset: star.radiusPx / outer, color: color(star.corona, 0.75) },
        { offset: 1, color: color(star.glow, 0) },
      ]),
    ],
    body: [
      `<circle cx="${n(star.centerX)}" cy="${n(star.centerY)}" r="${n(outer)}" fill="url(#corona${index})"/>`,
      `<circle cx="${n(star.centerX)}" cy="${n(star.centerY)}" r="${n(star.radiusPx)}" fill="${color(star.photosphere)}"/>`,
    ],
  };
}

function bodyParts(body: SceneBody, index: number): { defs: string[]; body: string[] } {
  if (body.kind === 'star') {
    return starDefsAndElements(body, index);
  }
  return { defs: planetDefs(body, index), body: planetElements(body, index) };
}

/**
 * Draws a scene as a standalone SVG document.
 *
 * A scene with no bodies renders as an empty string rather than an empty sky, matching the
 * Canvas2D writer: callers treat that as "nothing to show".
 *
 * `quality` is ignored, and that is not an oversight. The tier is a raster budget — half the linear
 * scale, a quarter of the fragments — and an SVG has no fragments to save. A vector file is the
 * same size in bytes whatever it will be drawn at.
 */
export function renderSceneToSvg(scene: AstronomicalScene, title: string): string {
  if (scene.bodies.length === 0) {
    return '';
  }

  const parts = scene.bodies.map(bodyParts);
  const defs = parts.flatMap((part) => part.defs).join('');
  const bodies = parts.flatMap((part) => part.body).join('');
  const background = backgroundElements(scene.background, scene.width, scene.height).join('');
  const label = title.replace(/[<>&]/g, '');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(scene.width)} ${n(scene.height)}" width="${n(scene.width)}" height="${n(scene.height)}" role="img" aria-label="${label}">`,
    `<title>${label}</title>`,
    `<defs>${defs}</defs>`,
    background,
    bodies,
    '</svg>',
  ].join('');
}
