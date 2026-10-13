import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate } from './regions';
import { generateRegionOverview } from './region_overview';
import { emptyRegionFacts } from './region_facts';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { regionToMarkdown, regionToText } from './region_presentation';

function fixture(seed = 'overview') {
  const rng = new RNG(seed);
  return generate({
    rng,
    nameGeneratorSet: getFantasyNameGeneratorSet('human', rng),
    dominantCulture: null,
    mapWidth: 12,
    mapHeight: 10,
    affiliation: 'affiliated',
    generateNeighbors: true,
    minRealms: 1,
    maxRealms: 1,
  });
}

function overview(region: ReturnType<typeof fixture>, seed = 'words') {
  return generateRegionOverview(region, new RNG(seed));
}

describe('evidence-based regional overview', () => {
  it.each(['alpha', 'beta', 'gamma', '5pkjdquccl04i'])(
    'stores reproducible prose and the selected evidence for %s',
    (seed) => {
      const region = fixture(seed);
      expect(region.description).toBe(fixture(seed).description);
      expect(region.overviewReason?.sources.length).toBeGreaterThan(0);
      expect(region.description).not.toMatch(
        /Hook:|unverified|implied|saved|mapped|assessment|low-altitude/,
      );
      const saved = toRegionSnapshot(region);
      expect(regionToMarkdown(saved)).toContain(region.description);
      expect(regionToText(saved)).toContain(region.description);
    },
  );
  it('varies wording while preserving every non-prose fact', () => {
    const region = fixture();
    const before = structuredClone(region.facts);
    const texts = new Set(Array.from({ length: 12 }, (_, i) => overview(region, String(i))));
    expect(texts.size).toBeGreaterThan(1);
    expect(region.facts).toEqual(before);
  });
  it('omits unsupported systems instead of copying environment prose', () => {
    const region = fixture();
    region.facts = emptyRegionFacts('current');
    region.environment.description = 'Imaginary navigable rivers and rich mines.';
    expect(overview(region)).toBe('');
    expect(region.overviewReason).toBeUndefined();
    region.facts = undefined;
    expect(overview(region)).toBe('');
  });
  it.each([
    ['river-crossing', /road meets a river|meeting of road and river/],
    ['coastal-port-site', /adjoins the sea|stands on the coast/],
    ['agricultural-site', /could support cultivation|suitable for cultivation/],
    ['river-settlement', /freshwater/],
    ['forest-settlement', /woodland/],
  ])('uses only the supported %s site meaning', (rule, wording) => {
    const region = fixture();
    const original = region.facts!.settlementRoles[0];
    region.facts = emptyRegionFacts('current');
    region.facts.settlementRoles = [
      {
        ...original,
        settlement: { kind: 'embedded', settlementId: region.settlementIds![0] },
        reason: { ruleId: `fantasy:region:${rule}:v1`, status: 'current', sources: [] },
      },
    ];
    region.settlements[0].name = 'Named Town';
    expect(overview(region)).toMatch(wording);
    expect(overview(region)).toContain('Named Town');
    expect(overview(region)).not.toMatch(/trade|bridge|safe crossing|industry|fields/);
    region.facts.settlementRoles[0].reason!.status = 'stale';
    expect(overview(region)).toBe('');
    region.facts.settlementRoles[0].reason!.status = 'current';
    region.facts.settlementRoles[0].settlement = { kind: 'artifact', targetId: 'outside' };
    expect(overview(region)).toBe('');
  });
  it.each(['User-written overview: nobody farms here.', '', '  '])(
    'preserves deliberately edited saved prose: %j',
    (description) => {
      const saved = toRegionSnapshot(fixture());
      saved.description = description;
      const restored = toRegionSnapshot(regionFromSnapshot(saved, new RNG('open')));
      expect(restored.description).toBe(description);
      expect(restored.facts).toEqual(saved.facts);
      expect(restored.overviewReason).toEqual(saved.overviewReason);
    },
  );
});
