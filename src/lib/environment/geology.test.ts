import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateGeologicalSetting } from './geology';
import { possibleRocks } from './terrain/terrain';

describe('coarse geological settings', () => {
  it('is repeatable, consumes saved terrain hints and tolerates unsupported rocks', () => {
    const makeup = { rockTypes: ['shale', 'sandstone'], soilTypes: ['gravel'] };
    expect(generateGeologicalSetting(makeup, new RNG('same'))).toEqual(
      generateGeologicalSetting(makeup, new RNG('same')),
    );
    expect(
      generateGeologicalSetting({ rockTypes: ['unknown'], soilTypes: [] }, new RNG('same')),
    ).toEqual({ hostRocks: ['unknown'], processes: [] });
    expect(generateGeologicalSetting(makeup, new RNG('same')).processes).toContain('placer');
  });
  it('supports every assemblage and generates saved petroleum maturity and traps', () => {
    const observed = new Set<string>();
    const maturity = new Set<string>();
    const trapped = new Set<boolean>();
    for (const rock of possibleRocks)
      for (let i = 0; i < 30; i++) {
        const setting = generateGeologicalSetting(
          { rockTypes: [rock], soilTypes: [] },
          new RNG(`${rock}:${i}`),
        );
        expect(setting.hostRocks).toContain(rock);
        setting.processes.forEach((entry) => observed.add(entry));
        if (setting.petroleum) {
          maturity.add(setting.petroleum.maturity);
          trapped.add(setting.petroleum.trapped);
          expect(setting.hostRocks).toContain(setting.petroleum.sealRock);
        }
      }
    expect(observed).toEqual(
      new Set([
        'intrusive',
        'hydrothermal',
        'volcanic',
        'volcanic-pipe',
        'metamorphic',
        'sedimentary',
        'organic-sedimentary',
        'evaporite',
        'petroleum',
      ]),
    );
    expect(maturity.size).toBe(3);
    expect(trapped.size).toBe(2);
  });
});
