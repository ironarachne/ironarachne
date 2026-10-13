import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { denseForestFixture } from '../../../scripts/region_dense_forest_fixture';
import { emptyRegionFacts } from './region_facts';
import { generateDenseForestFacts, generateDenseForestLandmark } from './region_dense_forests';
import { denseForestFactsError } from './region_dense_forest_validation';
import { rollRegion } from './region_roll';
import { toRegionSnapshot } from './region_snapshot';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { regionToMapSvg, regionToMarkdown } from './region_presentation';
import { generateNotableFacts } from './region_notables';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { regionFactsNeedingReview } from './region_editing';

function subject(seed = 'dense-forest') {
  const { region } = rollRegion(seed, { affiliation: 'unaffiliated' });
  region.map = denseForestFixture();
  region.facts = emptyRegionFacts('current');
  region.settlements = [];
  region.organizations = [];
  region.realms = [];
  generateDenseForestFacts(region);
  return region;
}

describe('regional dense forests', () => {
  // Full-region generation, codec validation, and SVG rendering exceed 5s on instrumented CI.
  it('shares a reproducible proper name and membership with the selected landmark and map label', () => {
    const a = subject(),
      b = subject();
    const landmark = generateDenseForestLandmark(a, new RNG('forest-landmark'))!;
    expect(generateDenseForestLandmark(b, new RNG('forest-landmark'))).toEqual(landmark);
    generateNotableFacts(a, new RNG('notables'), landmark);
    expect(a.facts!.notables).toContainEqual(landmark);
    expect(a.facts!.notables.length).toBeLessThanOrEqual(4);
    expect(a.facts!.denseForests[0].name).toBe(landmark.name);
    expect(landmark.anchor!.nodeIds).toEqual(a.facts!.denseForests[0].mapNodeIds);
    const saved = toRegionSnapshot(a);
    expect(validateRegionSnapshot(JSON.parse(JSON.stringify(saved))).ok).toBe(true);
    const svg = regionToMapSvg(saved);
    expect(svg).toContain('data-dense-forest-id=');
    expect(svg).toContain(landmark.name.replaceAll('&', '&amp;'));
    expect(regionToMarkdown(saved)).toContain(landmark.name);
    const c = subject();
    expect(generateDenseForestLandmark(c, new RNG('another-name'))!.name).not.toBe(landmark.name);
    expect(c.facts!.denseForests[0].mapNodeIds).toEqual(a.facts!.denseForests[0].mapNodeIds);
  }, 30000);
  it('keeps no-forest generation empty and accepts no missing facts', () => {
    const region = subject();
    region.map.nodes.forEach((node) => {
      node.biomeId = 'prairie';
    });
    generateDenseForestFacts(region);
    expect(region.facts!.denseForests).toEqual([]);
    expect(generateDenseForestLandmark(region, new RNG('empty'))).toBeUndefined();
    generateDenseForestFacts({ map: region.map, facts: undefined });
    expect(denseForestFactsError(undefined, region.map)).toMatch(/at most/);
  });
  it('upgrades v12 without inventing patches, changing words, or altering the input', () => {
    const saved = toRegionSnapshot(subject());
    const { denseForests: _forests, ...facts } = saved.facts;
    const old = { ...saved, description: 'Saved words', facts: { ...facts, version: 7 } };
    const before = structuredClone(old);
    const migrated = migrateRegionSnapshot(old, 12);
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) throw new Error(migrated.message);
    expect(migrated.value).toEqual({ ...old, facts: { ...facts, version: 8, denseForests: [] } });
    expect(regionToMapSvg(migrated.value)).not.toContain('data-dense-forest-id=');
    expect(old).toEqual(before);
    expect(migrateRegionSnapshot(saved, 12).ok).toBe(false);
  });
  it('rejects overlapping patches, invalid identities, absent evidence, and false membership', () => {
    const region = subject(),
      forest = region.facts!.denseForests[0];
    const variants = [
      [null],
      [forest, forest],
      [{ ...forest, id: 'forest:dense:wrong' }],
      [{ ...forest, reason: undefined }],
      [{ ...forest, reason: { ...forest.reason!, sources: [] } }],
      [{ ...forest, mapNodeIds: forest.mapNodeIds.slice(0, -1) }],
      [{ ...forest, reason: { ...forest.reason!, ruleId: 'wrong' } }],
    ];
    for (const value of variants) expect(denseForestFactsError(value, region.map)).not.toBeNull();
    expect(denseForestFactsError([forest], region.map)).toBeNull();
    const stale = structuredClone(forest);
    stale.reason!.status = 'stale';
    region.map.nodes.find((node) => node.id === forest.mapNodeIds[0])!.moisture = 0.9;
    expect(denseForestFactsError([forest], region.map)).toMatch(/observations|geography/);
    expect(denseForestFactsError([stale], region.map)).toBeNull();
  });
  it('marks dependent landmark wording stale after edits and respects authored removal guards', () => {
    const region = subject(),
      landmark = generateDenseForestLandmark(region, new RNG('landmark'))!;
    region.facts!.notables.push(landmark);
    const saved = toRegionSnapshot(region),
      forest = saved.facts.denseForests[0];
    const edited = setRegionResourceFactText(saved, 'denseForests', forest.id, 'name', 'My Wood');
    expect(edited.facts.denseForests[0].origin).toBe('authored');
    expect(regionToMapSvg(edited)).toContain('data-dense-forest-id=');
    expect(regionToMarkdown(edited)).toContain('My Wood');
    expect(regionFactsNeedingReview(edited).map((fact) => fact.id)).toContain(landmark.id);
    expect(validateRegionSnapshot(edited).ok).toBe(true);
    const removed = removeRegionResourceFact(saved, 'denseForests', forest.id);
    expect(removed.facts.denseForests).toEqual([]);
    expect(removed.facts.notables[0].reason!.status).toBe('stale');
    const linked = structuredClone(saved);
    linked.facts.notables[0].origin = 'authored';
    expect(removeRegionResourceFact(linked, 'denseForests', forest.id)).toBe(linked);
    expect(denseForestFactsError([{ ...forest, origin: 'authored' }], saved.map)).toBeNull();
  });
});
