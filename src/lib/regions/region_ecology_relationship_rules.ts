import type { EcologyFeedingRule, EcologyUseRule } from './region_ecology_relationship_types';

const grasses = ['grass', 'tall grass', 'bunchgrass', 'tussock grass', 'clover'];

/** Food compatibility is authored here, never inferred from threat, role or co-occurrence. */
export const ECOLOGY_FEEDING_RULES: readonly EcologyFeedingRule[] = [
  {
    id: 'heron-crayfish',
    subject: 'heron',
    subjectRole: 'predator',
    targets: ['crayfish'],
    targetCategory: 'fauna',
  },
  {
    id: 'deer-browse',
    subject: 'deer',
    subjectRole: 'grazer',
    targets: [...grasses, 'oak tree', 'birch tree', 'maple tree'],
    targetCategory: 'flora',
    coldBrowse: true,
  },
  {
    id: 'rabbit-browse',
    subject: 'rabbit',
    subjectRole: 'grazer',
    targets: grasses,
    targetCategory: 'flora',
    coldBrowse: true,
  },
  {
    id: 'ibex-grazing',
    subject: 'ibex',
    subjectRole: 'grazer',
    targets: grasses,
    targetCategory: 'flora',
    coldBrowse: true,
  },
];

export const ECOLOGY_USE_RULES: readonly EcologyUseRule[] = [
  {
    id: 'reed-material',
    sources: ['reeds', 'papyrus'],
    use: 'material',
    purpose: 'woven mats and basketry',
  },
  {
    id: 'woodland-material',
    sources: [
      'oak tree',
      'maple tree',
      'birch tree',
      'elm tree',
      'hickory tree',
      'pine tree',
      'fir tree',
      'spruce tree',
      'cedar tree',
    ],
    use: 'material',
    purpose: 'local woodwork',
  },
];

/** Existing site rules establish access, rather than a settlement name or regional association. */
export const ECOLOGY_ACCESS_RULES = new Set([
  'fantasy:region:river-settlement:v1',
  'fantasy:region:river-crossing:v1',
  'fantasy:region:forest-settlement:v1',
  'fantasy:region:agricultural-site:v1',
  'fantasy:region:coastal-port-site:v1',
]);

/** Explicit gathering hazard; a predator role or fantasy label alone is never a danger rule. */
export const DANGEROUS_BANK_SPECIES = new Set(['alligator', 'crocodile']);
