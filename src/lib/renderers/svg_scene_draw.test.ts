import { describe, expect, it } from 'vitest';

import { buildPlanetScene, buildStarScene } from './astronomical_scene';
import { renderSceneToSvg } from './svg_scene_draw';
import type { AstronomicalBody } from '$lib/astronomical_bodies';

/**
 * The SVG writer, checked as a document rather than as a picture.
 *
 * There is no pixel comparison here on purpose: an SVG is text, and what can go wrong with it is
 * structural — an unclosed element, a gradient referenced by an id nothing defines, a number
 * written as `NaN`. Those are all assertable without a browser, which is what makes this a unit
 * test where `preview_pixels.spec.ts` has to be a Playwright one.
 */
function body(overrides: Partial<AstronomicalBody> = {}): AstronomicalBody {
  return {
    name: 'Kesh',
    description: 'A cold world.',
    albedo: 0.3,
    axis_of_rotation: 23,
    classification: 'terrestrial planet',
    gravity: 9.8,
    has_atmosphere: true,
    has_ring_system: false,
    luminosity: 0,
    mass: 5.9,
    orbital_distance: 1,
    orbital_period: 365,
    radius: 6378,
    rotation_period: 24,
    surface_pressure: 1,
    surface_temperature: 288,
    ...overrides,
  };
}

const scene = buildPlanetScene(body(), 400, 400, 'svg-seed');

describe('writing a scene as SVG', () => {
  const svg = renderSceneToSvg(scene, 'Kesh');

  it('is a standalone document with the scene’s own dimensions', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain('viewBox="0 0 400 400"');
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('names itself, so a reader who cannot see it is told what it is', () => {
    expect(svg).toContain('<title>Kesh</title>');
    expect(svg).toContain('aria-label="Kesh"');
  });

  it('strips markup from the name rather than writing it into the document', () => {
    expect(renderSceneToSvg(scene, 'Kesh <script>')).not.toContain('<script>');
  });

  it('draws the background and its stars', () => {
    expect(svg).toContain('<rect width="400" height="400"');
    expect(svg).toContain('<circle cx=');
  });

  it('defines every gradient it references', () => {
    const referenced = [...svg.matchAll(/url\(#([a-z0-9]+)\)/gi)].map((match) => match[1]);
    expect(referenced.length).toBeGreaterThan(0);
    for (const id of referenced) {
      expect(svg, id).toContain(`id="${id}"`);
    }
  });

  it('writes no NaN into an attribute, whatever the arithmetic did', () => {
    expect(svg).not.toContain('NaN');
  });

  it('is the same document for the same scene', () => {
    expect(renderSceneToSvg(scene, 'Kesh')).toEqual(svg);
  });

  it('renders nothing for a scene with no bodies', () => {
    // Matching the Canvas2D writer: callers treat an empty string as "nothing to show".
    expect(renderSceneToSvg({ ...scene, bodies: [] }, 'Kesh')).toEqual('');
  });
});

describe('a ringed gas giant', () => {
  const ringed = buildPlanetScene(
    body({ classification: 'gas giant planet', has_ring_system: true, radius: 69911, mass: 1898 }),
    400,
    400,
    'ringed-seed',
  );
  const svg = renderSceneToSvg(ringed, 'Kesh');

  it('draws its bands under a clip path, so they stay on the disk', () => {
    expect(svg).toContain('<linearGradient id="bands0"');
    expect(svg).toContain('clip-path="url(#disk0)"');
  });

  it('draws the ring in two halves, one behind the planet and one in front', () => {
    const arcs = svg.match(/<path d="M [^"]+A [^"]+"/g) ?? [];
    expect(arcs.length).toEqual(2);
  });
});

describe('a star in a scene', () => {
  const starScene = buildStarScene(
    body({ classification: 'G-class star', luminosity: 1, radius: 695700 }),
    400,
    400,
    'star-seed',
  );

  it('draws its photosphere under a corona', () => {
    const svg = renderSceneToSvg(starScene, 'Sol');
    expect(svg).toContain('<radialGradient id="corona0"');
    expect(svg).not.toContain('NaN');
  });
});
