import { describe, expect, it } from 'vitest';
import {
  getGeologicalRawResources,
  getGeologicalSourceDefinitions,
  geologicalRawKey,
} from './raw_geological_catalog';
import { supportsGeologicalResource } from './geological_resources';

describe('reviewed geological source metadata', () => {
  it('retains unique raw keys, explicit references and nonfood qualification', () => {
    const raw = getGeologicalRawResources();
    expect(new Set(raw.map((entry) => entry.id)).size).toBe(raw.length);
    for (const definition of getGeologicalSourceDefinitions()) {
      expect(raw.some((entry) => entry.id === definition.rawResourceId)).toBe(true);
      expect(definition.reviewRefs.length).toBeGreaterThan(0);
      expect(definition.requirements.length).toBeGreaterThan(0);
    }
    expect(raw.every((entry) => entry.food.kind === 'not-food')).toBe(true);
    expect(geologicalRawKey('sand')).toBe('generic-sand');
    expect(geologicalRawKey('silica sand')).toBe('silica-sand');
    expect(geologicalRawKey('salt')).toBe('salt-ore');
  });
  it('supports each added occurrence only with its compatible hosts and processes', () => {
    const added = [
      'tungsten-ore',
      'molybdenum-ore',
      'tantalum-ore',
      'bismuth-ore',
      'native-sulfur',
      'silica-sand',
      'red-ochre-earth',
      'yellow-ochre-earth',
      'trona-ore',
      'potassium-salt-ore',
      'dolomite-rock',
    ];
    const definitions = getGeologicalSourceDefinitions();
    for (const id of added) {
      const entry = definitions.find((definition) => definition.rawResourceId === id)!;
      expect(entry, id).toBeDefined();
      expect(
        supportsGeologicalResource(
          { hostRocks: entry.occurrence.hostRocks, processes: entry.occurrence.processes },
          entry.occurrence,
        ),
        id,
      ).toBe(true);
      expect(
        supportsGeologicalResource(
          { hostRocks: ['unknown'], processes: entry.occurrence.processes },
          entry.occurrence,
        ),
        id,
      ).toBe(false);
      if (entry.occurrence.processes.length)
        expect(
          supportsGeologicalResource(
            { hostRocks: entry.occurrence.hostRocks, processes: [] },
            entry.occurrence,
          ),
          id,
        ).toBe(false);
    }
    for (const metal of [
      'aluminum',
      'platinum',
      'titanium',
      'nickel',
      'chromium',
      'vanadium',
      'zirconium',
      'hafnium',
      'rhenium',
      'indium',
    ])
      expect(definitions.some((entry) => entry.rawResourceId === `${metal}-ore`)).toBe(false);
  });
});
