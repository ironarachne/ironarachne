import { afterEach, describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { classifyAltitude, classifyRelief, measureRegionTerrain } from '$lib/map';
import { getGeologicalResources, supportsGeologicalResource } from '$lib/resources';
import type { RegionSemanticFact } from './region_resource_types';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';
import { rollRegionSnapshot } from './region_roll';
import { regionFactsError } from './region_facts';
import { validateRegionSnapshot, migrateRegionSnapshot } from './region_artifact_kind';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { regionToMarkdown, regionToText, regionToMapSvg } from './region_presentation';
import { setRegionPlaceText, regionFactsNeedingReview } from './region_editing';

const fixtures = REGION_SEED_BANK.map((entry) => ({
  ...entry,
  saved: rollRegionSnapshot(entry.seed),
}));
afterEach(() => vi.restoreAllMocks());

describe('release coherence across page-default regions', () => {
  it.each(fixtures)(
    '$contrast ($seed) retains observed evidence across all systems',
    ({ saved, habitat, contrast }) => {
      expect(validateRegionSnapshot(saved).ok).toBe(true);
      expect(regionFactsError(saved.facts, saved.map, saved.settlements)).toBeNull();
      const entries = Object.values(saved.facts)
        .filter(Array.isArray)
        .flat() as RegionSemanticFact[];
      expect(new Set(entries.map((fact) => fact.id)).size).toBe(entries.length);
      for (const fact of entries) {
        expect(fact.origin).toBe('generated');
        expect(fact.reason?.status).toBe('current');
        expect(fact.reason?.ruleId).toMatch(/^fantasy:.+:v\d+$/);
        expect(fact.reason?.sources.length).toBeGreaterThan(0);
        for (const source of fact.reason!.sources) {
          if (source.kind === 'fact')
            expect(entries.some((entry) => entry.id === source.factId)).toBe(true);
          if (source.kind === 'map-node')
            expect(source.observedValue).toBe(
              String(saved.map.nodes.find((node) => node.id === source.nodeId)![source.property]),
            );
          if (source.kind === 'map-edge')
            expect(source.observedValue).toBe(
              String(saved.map.edges.find((edge) => edge.id === source.edgeId)![source.property]),
            );
          if (source.kind === 'environment') {
            // Geological observations treat rock/soil inventories as unordered sets.
            if (source.field === 'terrain') {
              const observed = JSON.parse(source.observedValue) as typeof saved.environment.terrain;
              observed.geologicalMakeup.rockTypes.sort();
              observed.geologicalMakeup.soilTypes.sort();
              const expected = structuredClone(saved.environment.terrain);
              expected.geologicalMakeup.rockTypes.sort();
              expected.geologicalMakeup.soilTypes.sort();
              expect(observed).toEqual(expected);
            } else
              expect(JSON.parse(source.observedValue)).toEqual(saved.environment[source.field]);
          }
        }
      }
      for (const deposit of saved.facts.resourceDeposits) {
        const province = saved.facts.geology.find((entry) => entry.id === deposit.geologyId)!;
        const definition = getGeologicalResources().find(
          (entry) => entry.resource.name === deposit.resourceName,
        )!;
        expect(supportsGeologicalResource(province.setting, definition)).toBe(true);
        expect(deposit.anchor.nodeIds.every((id) => province.anchor.nodeIds.includes(id))).toBe(
          true,
        );
      }
      for (const resource of saved.facts.resources.filter(
        (entry) => entry.kind === 'arable-land',
      )) {
        for (const id of resource.anchor?.nodeIds ?? []) {
          const node = saved.map.nodes.find((entry) => entry.id === id)!;
          expect(node.biomeId).toMatch(/grassland|savanna|plains|prairie/i);
          expect(node.temperature).toBeGreaterThanOrEqual(5);
          expect(node.temperature).toBeLessThanOrEqual(30);
          expect(node.moisture).toBeGreaterThanOrEqual(0.3);
          expect(node.moisture).toBeLessThanOrEqual(0.8);
        }
      }
      const zone = saved.facts.habitats.find((fact) => fact.name === habitat)!;
      expect(zone).toBeDefined();
      expect(zone.anchor!.nodeIds.length).toBeGreaterThan(0);
      expect(
        zone.anchor!.nodeIds.every(
          (id) => saved.map.nodes.find((node) => node.id === id)!.biomeId === habitat,
        ),
      ).toBe(true);
      if (contrast === 'coastal')
        expect(saved.map.nodes.some((node) => node.isCoast && !node.isWater && !node.isOcean)).toBe(
          true,
        );
      const terrain = measureRegionTerrain(saved.map);
      if (contrast === 'mountain') expect(classifyRelief(terrain.reliefSpread)).toBe('mountainous');
      expect(saved.description).toContain(classifyAltitude(terrain.medianElevation));
      expect(saved.description).toContain(classifyRelief(terrain.reliefSpread));
      expect(saved.description).toContain(saved.facts.habitats[0].name.toLowerCase());
      expect(saved.facts.products.length).toBeGreaterThan(0);
      expect(saved.facts.dailyLife.length).toBeGreaterThan(0);
      expect(saved.facts.supply.length).toBeGreaterThan(0);
      for (const route of saved.facts.routes)
        for (const id of route.anchor.edgeIds) {
          const edge = saved.map.edges.find((entry) => entry.id === id)!;
          expect(route.kind === 'river' ? edge.river : edge.road).toBeGreaterThan(0);
        }
    },
  );

  it.each(fixtures)(
    '$seed repeats the complete saved payload independently of the clock',
    ({ seed, saved }) => {
      vi.spyOn(Date, 'now').mockReturnValue(1);
      expect(rollRegionSnapshot(seed)).toEqual(saved);
      vi.spyOn(Date, 'now').mockReturnValue(9_000_000);
      expect(rollRegionSnapshot(seed)).toEqual(saved);
      const json = JSON.parse(JSON.stringify(saved));
      expect(toRegionSnapshot(regionFromSnapshot(json, new RNG('unrelated-read')))).toEqual(saved);
    },
  );

  it.each(fixtures)(
    '$seed preserves edited prose, identities and stale warnings in all presentations',
    ({ saved }) => {
      const edited = setRegionPlaceText(
        { ...saved, description: 'Authored overview.' },
        'settlements',
        0,
        'name',
        'Reviewtown',
      );
      const reopened = toRegionSnapshot(
        regionFromSnapshot(JSON.parse(JSON.stringify(edited)), new RNG('open')),
      );
      expect(reopened).toEqual(edited);
      expect(reopened.map).toEqual(saved.map);
      expect(reopened.settlements.map((entry) => entry.id)).toEqual(
        saved.settlements.map((entry) => entry.id),
      );
      const review = regionFactsNeedingReview(reopened);
      expect(review.length).toBeGreaterThan(0);
      for (const text of [regionToMarkdown(reopened), regionToText(reopened)]) {
        expect(text).toContain('Authored overview.');
        expect(text).toContain('Reviewtown');
        expect(text).toMatch(/facts needing review/i);
        for (const fact of review) expect(text).toContain(fact.name);
      }
      expect(regionToMapSvg(reopened)).toContain('Reviewtown');
    },
  );

  it.each(fixtures)(
    '$seed opens pre-facts saves without generating missing systems or changing the map',
    ({ saved }) => {
      const { facts: _facts, ...legacy } = saved;
      const old = {
        ...legacy,
        settlements: saved.settlements.map((entry) => entry.snapshot),
        description: 'Old authored prose.',
      };
      const before = structuredClone(old);
      const migrated = migrateRegionSnapshot(old, 2);
      expect(migrated.ok).toBe(true);
      if (!migrated.ok) throw new Error(migrated.message);
      expect(old).toEqual(before);
      expect(migrated.value.facts.state).toBe('legacy');
      expect(Object.values(migrated.value.facts).filter(Array.isArray).flat()).toEqual([]);
      const reopened = toRegionSnapshot(regionFromSnapshot(migrated.value, new RNG('legacy-read')));
      expect(reopened.map).toEqual(saved.map);
      expect(reopened.environment).toEqual(saved.environment);
      expect(reopened.description).toBe('Old authored prose.');
      expect(reopened.settlements.map((entry) => entry.snapshot)).toEqual(old.settlements);
    },
  );
});
