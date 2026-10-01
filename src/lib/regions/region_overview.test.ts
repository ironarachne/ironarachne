import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain } from '$lib/map';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generate } from './regions';
import { generateRegionOverview } from './region_overview';
import { emptyRegionFacts } from './region_facts';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { regionToMarkdown, regionToText } from './region_presentation';
import type { SettlementRoleFact } from './region_fact_types';

function fixture(seed = 'overview') {
  const rng = new RNG(seed);
  return generate({
    rng,
    nameGeneratorSet: getFantasyNameGeneratorSet('human', rng),
    dominantCulture: null,
    mapWidth: 12,
    mapHeight: 10,
    minRealms: 1,
    maxRealms: 1,
  });
}

function overview(region: ReturnType<typeof fixture>, seed = 'words') {
  return generateRegionOverview(region, new RNG(seed));
}

describe('causal regional overview', () => {
  it.each(['alpha', 'beta', 'gamma', '5pkjdquccl04i'])(
    'agrees with the realized terrain, habitats and sections for %s',
    (seed) => {
      const region = fixture(seed);
      const metrics = measureRegionTerrain(region.map);
      expect(region.description).toContain(classifyAltitude(metrics.medianElevation));
      expect(region.description).toContain(classifyRelief(metrics.reliefSpread));
      expect(region.description).toContain(region.facts!.habitats[0].name.toLowerCase());
      expect(region.description).not.toContain('Hook:');
      for (const resource of region.facts!.resources.filter((fact) =>
        ['not-observed', 'unknown'].includes(fact.availability),
      ))
        expect(region.description).not.toContain(`${resource.name}:`);
      const saved = toRegionSnapshot(region);
      expect(regionToMarkdown(saved)).toContain(region.description);
      expect(regionToText(saved)).toContain(region.description);
      expect(fixture(seed).description).toBe(region.description);
    },
  );

  it('varies wording without changing any underlying facts', () => {
    const region = fixture();
    const before = toRegionSnapshot(region);
    const texts = new Set(Array.from({ length: 12 }, (_, index) => overview(region, `${index}`)));
    expect(texts.size).toBeGreaterThan(1);
    expect(toRegionSnapshot(region)).toEqual(before);
  });

  it('omits empty optional systems and never reuses unsupported environment prose', () => {
    const region = fixture();
    region.facts = emptyRegionFacts('current');
    region.environment.description = 'Imaginary navigable rivers and rich mines.';
    const text = overview(region);
    expect(text).not.toMatch(/river|mine|farm|trade|forest|road|resource|hazard/i);
    expect(text).toContain(region.name);
    expect(text.split('.').filter(Boolean)).toHaveLength(1);
    region.facts = undefined;
    expect(overview(region)).toBe(text);
    region.map.nodes.forEach((node) => {
      node.isOcean = true;
    });
    expect(overview(region)).toBe('');
  });

  it.each([
    ['river-crossing', 'road crosses a river'],
    ['coastal-port-site', 'access for coastal trade'],
    ['agricultural-site', 'supporting nearby farming'],
    ['river-settlement', 'provides local freshwater'],
    ['forest-settlement', 'access to woodland resources'],
  ])(
    'renders the supported %s site cause against its stable settlement identity',
    (rule, clause) => {
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
      region.settlements.reverse();
      region.settlementIds!.reverse();
      expect(overview(region)).toContain(
        `Named Town ${clause === 'road crosses a river' ? 'stands where a ' : ''}`,
      );
      expect(overview(region)).toContain(clause);
      expect(overview(region)).not.toMatch(/sheltered harbor|navigable|\bore\b|\bfish\b/i);
    },
  );

  it('omits stale or unresolved site roles and unsupported economic roles', () => {
    const region = fixture();
    const original = region.facts!.settlementRoles[0];
    const role: SettlementRoleFact = {
      ...original,
      reason: { ruleId: 'fantasy:region:forest-settlement:v1', status: 'stale', sources: [] },
    };
    region.facts = emptyRegionFacts('current');
    region.facts.settlementRoles = [role];
    expect(overview(region)).not.toContain('woodland resources');
    role.reason!.status = 'current';
    role.settlement = { kind: 'artifact', targetId: 'outside' };
    expect(overview(region)).not.toContain('woodland resources');
    role.settlement = { kind: 'embedded', settlementId: 'missing' };
    expect(overview(region)).not.toContain('woodland resources');
    role.settlement = original.settlement;
    role.reason!.ruleId = 'fantasy:region:land-placement:v1';
    expect(overview(region)).not.toContain('woodland resources');
  });

  it('includes supported resources, road endpoints and localized hazard causes without hooks', () => {
    const region = fixture();
    region.facts = emptyRegionFacts('current');
    region.facts.resources.push({
      id: 'resource:timber',
      kind: 'timber',
      availability: 'limited' as const,
      depositIds: [],
      name: 'Timber',
      description: 'The woodland supplies timber.',
      origin: 'generated',
      areaIds: [],
      habitatIds: [],
    });
    region.facts.routes.push({
      id: 'route:road',
      name: 'Road',
      description: '',
      kind: 'road',
      origin: 'generated',
      areaIds: [],
      anchor: { nodeIds: [], edgeIds: [] },
      endpoints: [0, 1].map((index) => ({
        kind: 'settlement',
        settlement: {
          kind: 'embedded',
          settlementId: region.settlementIds![index],
        },
      })) as [
        (typeof region.facts.routes)[number]['endpoints'][0],
        (typeof region.facts.routes)[number]['endpoints'][1],
      ],
    });
    region.facts.notables.push({
      id: 'hazard:cold',
      kind: 'hazard',
      name: 'Cold country',
      origin: 'generated',
      areaIds: [],
      description:
        'In the northern part of the region: freezing temperatures make exposure a concern. Hook: find shelter.',
    });
    const text = overview(region);
    expect(text).toContain('Timber: The woodland supplies timber.');
    expect(text).toContain(
      `A road links ${region.settlements[0].name} and ${region.settlements[1].name}.`,
    );
    expect(text).toContain(
      'northern part of the region: freezing temperatures make exposure a concern.',
    );
    expect(text).not.toContain('Hook:');
    region.facts.routes[0].endpoints[1] = { kind: 'boundary', edgeId: 1 };
    expect(overview(region)).not.toContain('A road links');
    region.facts.routes[0].endpoints[1] = {
      kind: 'settlement',
      settlement: { kind: 'artifact', targetId: 'external' },
    };
    expect(overview(region)).not.toContain('A road links');
    region.facts.notables[0].kind = 'landmark';
    region.facts.resources[0].description = '';
    expect(overview(region)).not.toMatch(/supplies timber|exposure/);
  });

  it.each(['User-written overview: nobody farms here.', '', '  '])(
    'preserves edited or deliberately blank saved prose: %j',
    (description) => {
      const saved = toRegionSnapshot(fixture());
      saved.description = description;
      const restored = toRegionSnapshot(regionFromSnapshot(saved, new RNG('open')));
      expect(restored.description).toBe(description);
      expect(restored.facts).toEqual(saved.facts);
      expect(restored.map).toEqual(saved.map);
    },
  );
});
