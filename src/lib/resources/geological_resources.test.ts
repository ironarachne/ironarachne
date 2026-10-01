import { describe, expect, it } from 'vitest';
import { getGeologicalResources, supportsGeologicalResource } from './geological_resources';
import { getAllMetalOres } from './metal_ores';
import type { GeologicalSetting } from '$lib/environment';

const catalog = getGeologicalResources();
describe('geological resource catalog', () => {
  it('covers metals, gems, raw stones, industrial materials and hydrocarbons', () => {
    expect(new Set(catalog.map((entry) => entry.category))).toEqual(
      new Set(['metal-ore', 'gemstone', 'stone', 'industrial-mineral', 'oil', 'gas']),
    );
    expect(catalog.find((entry) => entry.resource.name === 'iron ore')!.resource).toBe(
      getAllMetalOres().find((entry) => entry.name === 'iron ore'),
    );
    expect(catalog.filter((entry) => entry.category === 'stone')).toHaveLength(8);
    expect(catalog.some((entry) => /ashlar|brick|tile|thatch/.test(entry.resource.name))).toBe(
      false,
    );
  });
  it('rejects incompatible host/process combinations, including diamond in ordinary basalt', () => {
    const diamond = catalog.find((entry) => entry.resource.name === 'diamond')!;
    expect(
      supportsGeologicalResource({ hostRocks: ['basalt'], processes: ['volcanic-pipe'] }, diamond),
    ).toBe(false);
    expect(
      supportsGeologicalResource({ hostRocks: ['kimberlite'], processes: ['volcanic'] }, diamond),
    ).toBe(false);
    expect(
      supportsGeologicalResource(
        { hostRocks: ['kimberlite'], processes: ['volcanic-pipe'] },
        diamond,
      ),
    ).toBe(true);
    expect(
      supportsGeologicalResource(
        { hostRocks: [], processes: ['placer'] },
        catalog.find((entry) => entry.resource.name === 'gravel')!,
      ),
    ).toBe(true);
  });
  it('requires a complete trapped petroleum system and appropriate maturity', () => {
    const oil = catalog.find((entry) => entry.category === 'oil')!;
    const gas = catalog.find((entry) => entry.category === 'gas')!;
    const setting: GeologicalSetting = {
      hostRocks: ['shale', 'sandstone', 'evaporite'],
      processes: ['petroleum'],
      petroleum: {
        sourceRock: 'shale',
        reservoirRock: 'sandstone',
        sealRock: 'evaporite',
        maturity: 'oil-window',
        trapped: true,
      },
    };
    expect(supportsGeologicalResource(setting, oil)).toBe(true);
    expect(supportsGeologicalResource(setting, gas)).toBe(false);
    const copy = structuredClone(setting);
    copy.petroleum!.maturity = 'gas-window';
    expect(supportsGeologicalResource(copy, gas)).toBe(true);
    expect(supportsGeologicalResource(copy, oil)).toBe(false);
    for (const broken of [
      { ...setting, petroleum: undefined },
      { ...setting, hostRocks: ['shale'] },
      { ...setting, processes: [] },
      { ...setting, petroleum: { ...setting.petroleum!, trapped: false } },
      { ...setting, petroleum: { ...setting.petroleum!, maturity: 'immature' as const } },
      { ...setting, petroleum: { ...setting.petroleum!, sourceRock: 'granite' } },
    ])
      expect(supportsGeologicalResource(broken, oil)).toBe(false);
  });
});
