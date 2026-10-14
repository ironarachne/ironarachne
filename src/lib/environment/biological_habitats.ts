import type { BiologicalHabitatPatch, BiologicalHabitatRule } from './biological_source_types';

/** Coarse authored world rules; water and occurrence evidence are supplied by the caller. */
export function supportsBiologicalHabitat(
  patch: BiologicalHabitatPatch,
  rule: BiologicalHabitatRule,
): boolean {
  return (
    rule.environments.some((environment) => patch.environments.includes(environment)) &&
    patch.temperature >= rule.temperature[0] &&
    patch.temperature <= rule.temperature[1] &&
    patch.moisture >= rule.moisture[0] &&
    patch.moisture <= rule.moisture[1] &&
    (!rule.landforms.length || rule.landforms.includes(patch.landform)) &&
    (rule.water === 'none' || patch.water.includes(rule.water))
  );
}

const profileData: Record<string, [string[], [number, number], [number, number]]> = {
  'reed-margin': [
    ['swamp', 'grassland', 'forest'],
    [0, 30],
    [0.6, 1],
  ],
  'papyrus-margin': [['swamp'], [15, 35], [0.6, 1]],
  'temperate-field': [['grassland'], [8, 25], [0.3, 0.7]],
  'cool-field': [['grassland'], [5, 22], [0.3, 0.7]],
  'warm-field': [['grassland'], [18, 30], [0.35, 0.75]],
  'temperate-orchard': [['grassland'], [8, 26], [0.3, 0.7]],
  'warm-orchard': [['grassland'], [12, 30], [0.3, 0.6]],
  'temperate-woodland': [['forest'], [5, 25], [0.35, 0.8]],
  'temperate-edge': [
    ['forest', 'grassland'],
    [5, 25],
    [0.35, 0.8],
  ],
  'dry-herb': [['grassland'], [10, 28], [0.3, 0.55]],
  'wet-willow': [
    ['forest', 'grassland', 'swamp'],
    [5, 25],
    [0.5, 0.9],
  ],
  'pine-woodland': [['forest'], [8, 30], [0.3, 0.8]],
  pasture: [['grassland'], [5, 28], [0.3, 0.8]],
  'goat-browse': [
    ['forest', 'mountain'],
    [5, 28],
    [0.3, 0.8],
  ],
  'bee-forage': [
    ['forest', 'grassland'],
    [10, 30],
    [0.3, 0.8],
  ],
  'freshwater-fish': [
    ['forest', 'grassland', 'swamp'],
    [5, 25],
    [0.3, 1],
  ],
  'freshwater-crayfish': [
    ['forest', 'grassland', 'swamp'],
    [5, 25],
    [0.4, 1],
  ],
  'cool-coast': [['coastal'], [5, 25], [0.3, 1]],
  'warm-coast': [['coastal'], [10, 30], [0.3, 1]],
};

/** Return independent bank/shore rules rather than allowing one water kind to imply another. */
export function getBiologicalHabitatRules(profile: string): BiologicalHabitatRule[] {
  const data = profileData[profile];
  if (!data) return [];
  const waters: BiologicalHabitatRule['water'][] = profile.endsWith('coast')
    ? ['coastal-margin']
    : [
          'reed-margin',
          'papyrus-margin',
          'wet-willow',
          'freshwater-fish',
          'freshwater-crayfish',
        ].includes(profile)
      ? ['freshwater-bank', 'freshwater-shore']
      : ['none'];
  return waters.map((water) => ({
    id: `fantasy:habitat:${profile}:${water}:v1`,
    environments: [...data[0]],
    temperature: [...data[1]],
    moisture: [...data[2]],
    landforms: [],
    water,
  }));
}
