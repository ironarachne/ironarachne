import type { AstronomicalBody, StarSystem } from '$lib/astronomical_bodies';

export type StarSystemLayoutStar = {
  kind: 'star';
  centerX: number;
  bodySizePixels: number;
  body: AstronomicalBody;
  starIndex: number;
};

export type StarSystemLayoutPlanet = {
  kind: 'planet';
  centerX: number;
  bodySizePixels: number;
  body: AstronomicalBody;
  planetIndex: number;
};

export type StarSystemLayoutItem = StarSystemLayoutStar | StarSystemLayoutPlanet;

/**
 * Places a system's bodies across the preview. This is a step inside the scene builder and the
 * only place the arithmetic lives — both backends read the absolute positions it resolves to.
 */
export function computeStarSystemLayout(
  system: StarSystem,
  width: number,
  height: number,
): {
  items: StarSystemLayoutItem[];
  baseUnitWidth: number;
  totalUnits: number;
} {
  const totalUnits = system.stars.length * 4 + system.planets.length;
  if (totalUnits === 0) {
    return { items: [], baseUnitWidth: 0, totalUnits: 0 };
  }

  const baseUnitWidth = width / totalUnits;
  let maxStarRadius = 0;
  let maxPlanetRadius = 0;
  for (const body of system.stars) maxStarRadius = Math.max(maxStarRadius, body.radius);
  for (const body of system.planets) maxPlanetRadius = Math.max(maxPlanetRadius, body.radius);

  const items: StarSystemLayoutItem[] = [];
  let currentX = 0;

  for (let i = 0; i < system.stars.length; i++) {
    const star = system.stars[i];
    const relativeScale = maxStarRadius > 0 ? Math.pow(star.radius / maxStarRadius, 0.5) : 1;
    const statCellWidth = baseUnitWidth * 4;
    currentX += statCellWidth / 2;
    const bodySizePixels = Math.min(height, statCellWidth * 0.75) * 0.75 * relativeScale;
    items.push({
      kind: 'star',
      centerX: currentX,
      bodySizePixels,
      body: star,
      starIndex: i,
    });
    currentX += statCellWidth / 2;
  }

  for (let i = 0; i < system.planets.length; i++) {
    const planet = system.planets[i];
    const relativeScale = maxPlanetRadius > 0 ? Math.pow(planet.radius / maxPlanetRadius, 0.5) : 1;
    const planetCellWidth = baseUnitWidth;
    currentX += planetCellWidth / 2;
    const bodySizePixels = Math.min(height, planetCellWidth) * 0.25 * relativeScale;
    items.push({
      kind: 'planet',
      centerX: currentX,
      bodySizePixels,
      body: planet,
      planetIndex: i,
    });
    currentX += planetCellWidth / 2;
  }

  return { items, baseUnitWidth, totalUnits };
}
