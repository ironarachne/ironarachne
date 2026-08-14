import { describe, expect, it } from 'vitest';

import {
  defaultHeraldryGeneratorOptions,
  HERALDRY_SNAPSHOT_NAME_MAX_LENGTH,
  normalizeHeraldryGeneratorOptions,
  toHeraldrySnapshot,
  type HeraldryGeneratorOptionsSnapshot,
} from './heraldry_snapshot.js';

const sampleGeneratorOptions: HeraldryGeneratorOptionsSnapshot = {
  heraldryTag: 'any',
  chargeTinctureName: 'gules',
  numberOfChargesOption: 'one',
  chargePosition: 'normal',
  lockSeed: true,
  fieldDivisionOption: 'pale',
  variationSlotOptions: ['barry', 'plain'],
  variationTinctureOptions: [['azure', 'Or'], ['gules']],
};

describe('heraldry_snapshot', () => {
  it('truncates snapshot name from blazon', () => {
    const longBlazon = 'x'.repeat(HERALDRY_SNAPSHOT_NAME_MAX_LENGTH + 10);
    const snapshot = toHeraldrySnapshot(
      {
        device: {
          field: {
            name: 'plain',
            blazon: 'variation1',
            variationCount: 1,
            pattern: '',
            commonality: 1,
            variations: [],
          },
          chargeGroups: [],
        },
        blazon: longBlazon,
      },
      'seed',
      sampleGeneratorOptions,
    );
    expect(snapshot.name.length).toBe(HERALDRY_SNAPSHOT_NAME_MAX_LENGTH);
    expect(snapshot.name.endsWith('…')).toBe(true);
  });

  it('defaultHeraldryGeneratorOptions returns all-any generator defaults', () => {
    expect(defaultHeraldryGeneratorOptions()).toEqual({
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
      fieldDivisionOption: 'any',
      variationSlotOptions: ['any', 'any', 'any'],
      variationTinctureOptions: [
        ['any', 'any'],
        ['any', 'any'],
        ['any', 'any'],
      ],
    });
  });

  it('normalizeHeraldryGeneratorOptions fills defaults for legacy snapshots', () => {
    const legacy: HeraldryGeneratorOptionsSnapshot = {
      heraldryTag: 'any',
      chargeTinctureName: 'any',
      numberOfChargesOption: 'any',
      chargePosition: 'normal',
      lockSeed: false,
    };
    expect(normalizeHeraldryGeneratorOptions(legacy)).toEqual({
      ...legacy,
      fieldDivisionOption: 'any',
      variationSlotOptions: ['any', 'any', 'any'],
      variationTinctureOptions: [
        ['any', 'any'],
        ['any', 'any'],
        ['any', 'any'],
      ],
    });
  });
});
