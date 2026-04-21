/** Maps stellar radius (km) to disk radius in pixels for a square preview. */
export function starRadiusKmToPreviewPixels(radiusKm: number, imageSize: number): number {
  const radiusRelativeToSun = radiusKm / 695700;
  const sunSizeInPixels = imageSize / 6.0;
  const maxSizeInPixels = imageSize / 3.5;
  const minSizeInPixels = imageSize / 8.0;
  const sizeInPixels = radiusRelativeToSun * sunSizeInPixels;
  return Math.max(minSizeInPixels, Math.min(maxSizeInPixels, sizeInPixels));
}

/** Maps planetary radius (km) to disk radius in pixels for a square preview. */
export function planetRadiusKmToPreviewPixels(radiusKm: number, imageSize: number): number {
  const radiusRelativeToEarth = radiusKm / 6371;
  const earthSizeInPixels = imageSize / 4;
  const maxPlanetSizeInPixels = imageSize / 2.5;
  const sizeInPixels = radiusRelativeToEarth * earthSizeInPixels;
  return Math.min(maxPlanetSizeInPixels, sizeInPixels);
}

export function starCoronaWidthPixelsFromDiskRadius(starDiskRadiusPx: number): number {
  return Math.max(starDiskRadiusPx * 0.2, 4.0);
}
