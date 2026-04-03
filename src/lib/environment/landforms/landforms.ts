import type { LandformType } from './landform_types';

export function all(): LandformType[] {
  return [
    {
      name: 'plains',
      description: 'a flat, grassy area',
      majorType: 'plains',
      elevationMin: -0.2,
      elevationMax: 0.2,
      grade: 0.1,
      validSoils: ['loam', 'sand', 'clay', 'silt'],
    },
    {
      name: 'hills',
      description: 'a series of small, rolling hills',
      majorType: 'hills',
      elevationMin: 0.1,
      elevationMax: 0.4,
      grade: 0.3,
      validSoils: ['loam', 'sand', 'clay', 'gravel', 'silt'],
    },
    {
      name: 'mountains',
      description: 'a large mountain range',
      majorType: 'mountains',
      elevationMin: 0.3,
      elevationMax: 1.0,
      grade: 0.8,
      validRocks: ['granite', 'basalt', 'sandstone', 'obsidian', 'slate', 'marble'],
    },
    {
      name: 'canyon',
      description: 'a deep, narrow valley with steep sides',
      majorType: 'mountains',
      elevationMin: 0.1,
      elevationMax: 0.6,
      grade: 0.9,
      validRocks: ['sandstone', 'limestone', 'basalt'],
    },
    {
      name: 'lake',
      description: 'a large body of water',
      majorType: 'hills',
      elevationMin: -0.1,
      elevationMax: 0.1,
      grade: 0.0,
    },
    {
      name: 'river',
      description: 'a long, winding river',
      majorType: 'plains',
      elevationMin: -0.1,
      elevationMax: 0.1,
      grade: 0.1,
    },
  ];
}
