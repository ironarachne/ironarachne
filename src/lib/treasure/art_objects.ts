import type { ArtObject, ArtObjectType } from "./treasure_types";

export const artObjectTypes: ArtObjectType[] = [
  { name: "painting", baseValue: 2000, baseWeight: 5, densityCategory: 'bulky' },
  { name: "sculpture", baseValue: 3000, baseWeight: 20, densityCategory: 'standard' },
  { name: "tapestry", baseValue: 1500, baseWeight: 10, densityCategory: 'airy' },
  { name: "statue", baseValue: 4000, baseWeight: 150, densityCategory: 'dense' },
  { name: "mosaic", baseValue: 2500, baseWeight: 30, densityCategory: 'standard' },
];

/**
 * Create an art object.
 *
 * @param id the id to assign to the art object
 * @param type the type of art object
 * @param artist the name of the artist, if known
 * @param description the description of the art object
 * @returns
 */
export function generateArtObject(id: string, type: ArtObjectType, artist?: string, description?: string): ArtObject {
  return {
    id,
    name: type.name,
    description: description || `A beautiful ${type.name.toLowerCase()} created by ${artist || "Unknown Artist"}.`,
    artist: artist || "Unknown Artist",
    value: type.baseValue,
    rarity: 'uncommon',
    properties: [],
    densityCategory: type.densityCategory,
    weight: type.baseWeight,
  }
}

/**
 * Get an art object up to a maximum value.
 *
 * @param maxValue the maximum value to limit art by
 * @returns
 */
export function getArtObjectOfMaxValue(maxValue: number): ArtObject {
  const affordableArtObjects = artObjectTypes.filter(art => art.baseValue <= maxValue);
  if (affordableArtObjects.length === 0) {
    throw new Error("No art objects available within the specified value.");
  }

  const selectedArt = affordableArtObjects[Math.floor(Math.random() * affordableArtObjects.length)];
  return generateArtObject(`art-${selectedArt.name.toLowerCase()}`, selectedArt);
}

/**
 * Get a set of art objects totalling up to the specified value.
 *
 * @param totalValue the total value of the art to create
 * @returns
 */
export function getArtObjectsForValue(totalValue: number): ArtObject[] {
  const selectedArtObjects: ArtObject[] = [];
  let remainingValue = totalValue;

  const sortedArtTypes = [...artObjectTypes].sort((a, b) => b.baseValue - a.baseValue);

  for (const artType of sortedArtTypes) {
    while (remainingValue >= artType.baseValue) {
      const artObject = generateArtObject(
        `art-${selectedArtObjects.length + 1}-${artType.name.toLowerCase()}`,
        artType
      );
      selectedArtObjects.push(artObject);
      remainingValue -= artType.baseValue;
    }
  }

  return selectedArtObjects;
}
