import type { ResourceKind } from './region_fact_types';
export const resourceKinds: ResourceKind[] = [
  'freshwater',
  'arable-land',
  'fish',
  'timber',
  'stone',
  'ore',
  'gemstone',
  'fiber',
  'animal-material',
  'food',
  'geological-material',
  'oil',
  'gas',
];
export const depositKinds = {
  'metal-ore': 'ore',
  gemstone: 'gemstone',
  stone: 'stone',
  'industrial-mineral': 'geological-material',
  oil: 'oil',
  gas: 'gas',
} as const;
