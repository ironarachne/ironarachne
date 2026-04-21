/** Canvas2D preview uses gas-giant-style shading only for true gas giants (matches WebGL shader choice). */
export function isGasGiantPlanetClassification(classification: string): boolean {
  return classification === 'gas giant planet';
}
