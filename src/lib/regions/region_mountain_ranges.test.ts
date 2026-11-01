import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { cultureFromSnapshot, rollCultureSnapshot } from '$lib/culture';
import { mountainRangeFixture } from '../../../scripts/region_mountain_range_fixture';
import { generateMountainRangeFacts } from './region_mountain_ranges';
import { mountainRangeFactsError } from './region_mountain_range_validation';
import { emptyRegionFacts } from './region_facts';
import {
  legacyRegionSnapshot as rollRegionSnapshot,
  legacyRegion as rollRegion,
} from '../../../test_fixtures/region_legacy';
import {
  validateRegionSnapshot,
  migrateRegionSnapshot,
  REGION_PAYLOAD_VERSION,
} from './region_artifact_kind';
import {
  regionToMapSvg,
  regionToMarkdown,
  regionToDocument,
  regionToText,
  regionToExportDocument,
} from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { removeRegionResourceFact, setRegionResourceFactText } from './region_resource_editing';
import { generateLandscapeNames } from './region_landscape_names';
import { toRegionSnapshot } from './region_snapshot';
import type { MountainRangeFact } from './region_mountain_range_types';

function subject() {
  return {
    map: mountainRangeFixture(true),
    facts: emptyRegionFacts('current'),
    dominantCulture: null,
  };
}
function fixtureSnapshot() {
  const region = subject();
  generateMountainRangeFacts(region, new RNG('range'));
  return {
    ...rollRegionSnapshot('range-fixture', { affiliation: 'unaffiliated' }),
    overviewReason: undefined,
    map: region.map,
    facts: region.facts,
    settlements: [],
    realms: [],
    organizations: [],
  };
}

describe('saved regional mountain ranges', () => {
  it('saves geographic identity, provenance and supported prose with repeatable wording', () => {
    const a = subject(),
      b = subject();
    generateMountainRangeFacts(a, new RNG('range'));
    generateMountainRangeFacts(b, new RNG('range'));
    expect(a).toEqual(b);
    expect(a.facts.mountainRanges).toHaveLength(1);
    const range = a.facts.mountainRanges[0];
    expect(range.id).toBe(`range:mountain:${range.mapNodeIds[0]}`);
    expect(range.reason?.ruleId).toBe('fantasy:region:mountain-range:v1');
    expect(range.reason?.sources).toHaveLength(a.map.nodes.length * 3);
    expect(range.description).toMatch(/mountain ridges/);
    expect(range.description).not.toMatch(/snow|glacier|impassable|ore|meters/i);
    expect(mountainRangeFactsError(a.facts.mountainRanges, a.map)).toBeNull();
    const c = subject();
    generateMountainRangeFacts(c, new RNG('other'));
    expect(c.facts.mountainRanges[0].name).not.toBe(range.name);
    expect(c.facts.mountainRanges[0].mapNodeIds).toEqual(range.mapNodeIds);
    expect(c.facts.mountainRanges[0].spineNodeIds).toEqual(range.spineNodeIds);
  });
  it('describes high mountain relief and location only when both are supported', () => {
    const region = subject();
    region.map.width = 80;
    region.map.height = 60;
    region.map.nodes.forEach((node) => {
      if (node.elevation > 0) node.elevation = 1;
    });
    generateMountainRangeFacts(region, new RNG('high-range'));
    expect(region.facts.mountainRanges[0].description).toMatch(
      /High mountains|high mountain terrain/,
    );
    expect(region.facts.mountainRanges[0].description).toContain('northwest');
    const range = region.facts.mountainRanges[0];
    expect(mountainRangeFactsError([null], region.map)).toMatch(/not an object/);
    expect(
      mountainRangeFactsError([{ ...range, reason: { ...range.reason, sources: [] } }], region.map),
    ).toMatch(/observations/);
    expect(
      mountainRangeFactsError(
        [{ ...range, reason: { ...range.reason, sources: undefined } }],
        region.map,
      ),
    ).toMatch(/observations/);
  });

  it('generates no unsupported ranges and tolerates absent facts', () => {
    const region = subject();
    region.map.nodes.forEach((node) => {
      node.elevation = 0;
    });
    generateMountainRangeFacts(region, new RNG('range'));
    expect(region.facts.mountainRanges).toEqual([]);
    expect(() =>
      generateMountainRangeFacts({ ...region, facts: undefined }, new RNG('range')),
    ).not.toThrow();
  });
  it('repeats the whole seeded generation path and preserves siblings when range draws change', () => {
    const a = rollRegion('mountain-range-9').region,
      b = rollRegion('mountain-range-9').region;
    expect(toRegionSnapshot(a)).toEqual(toRegionSnapshot(b));
    expect(a.facts!.mountainRanges.length).toBeGreaterThan(0);
    const original = toRegionSnapshot(a);
    const rng = new RNG('changed-wording');
    rng.float(0, 1);
    b.facts!.mountainRanges = [];
    generateMountainRangeFacts(b, rng);
    const changed = toRegionSnapshot(b);
    expect({
      ...changed,
      facts: { ...changed.facts, mountainRanges: original.facts.mountainRanges },
    }).toEqual(original);
    expect(changed.facts.mountainRanges[0].spineNodeIds).toEqual(
      original.facts.mountainRanges[0].spineNodeIds,
    );
    expect(changed.facts.mountainRanges[0].name).not.toBe(original.facts.mountainRanges[0].name);
  });
  it('uses cultural patterns without consuming live cultural generators', () => {
    const culture = cultureFromSnapshot(
      rollCultureSnapshot('range-culture'),
      new RNG('culture-state'),
    );
    const a = rollRegion('range-culture', {}, culture).region;
    const first = { ...subject(), dominantCulture: culture };
    generateMountainRangeFacts(first, new RNG('cultural-range'));
    culture.nameGenerators.female.generate(5);
    culture.nameGenerators.family.generate(5);
    const second = { ...subject(), dominantCulture: culture };
    generateMountainRangeFacts(second, new RNG('cultural-range'));
    expect(first.facts.mountainRanges).toEqual(second.facts.mountainRanges);
    // Adding the new vocabulary does not rename existing habitat zones.
    const before = structuredClone(a.facts!.areas);
    generateLandscapeNames(a, new RNG('independent-zone-names'));
    expect(a.facts!.areas.map((area) => area.mapNodeIds)).toEqual(
      before.map((area) => area.mapNodeIds),
    );
  });
  it('migrates previous payloads with an empty list and retains old maps, wording, and affiliation', () => {
    const snapshot = fixtureSnapshot();
    const { mountainRanges: _ranges, ...facts } = snapshot.facts;
    const old = { ...snapshot, description: 'My edited overview', facts: { ...facts, version: 6 } };
    const before = structuredClone(old);
    const migrated = migrateRegionSnapshot(old, 11);
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) throw new Error(migrated.message);
    expect(migrated.value).toEqual({
      ...old,
      facts: { ...facts, version: 12, denseForests: [], mountainRanges: [] },
    });
    expect(regionToMapSvg(migrated.value)).not.toContain('data-range-id=');
    expect(old).toEqual(before);
    expect(REGION_PAYLOAD_VERSION).toBe(24);
    expect(migrateRegionSnapshot(snapshot, 12).ok).toBe(false);
    expect(migrateRegionSnapshot(snapshot, 11).ok).toBe(false);
    expect(validateRegionSnapshot(snapshot).ok).toBe(true);
  });
  it('rejects overlapping, malformed, unsupported, and incorrectly identified saved ranges', () => {
    const saved = fixtureSnapshot();
    const range = saved.facts.mountainRanges[0];
    for (const mountainRanges of [
      undefined,
      [{ ...range, mapNodeIds: null }],
      [{ ...range, spineNodeIds: [1.1] }],
      [{ ...range, id: 'range:mountain:wrong' }],
      [{ ...range, reason: { ...range.reason, ruleId: 'unsupported' } }],
      [range, { ...range, id: 'range:mountain:other', origin: 'authored' }],
    ]) {
      expect(
        validateRegionSnapshot({ ...saved, facts: { ...saved.facts, mountainRanges } }).ok,
      ).toBe(false);
    }
    expect(
      mountainRangeFactsError([{ ...range, mapNodeIds: [999], spineNodeIds: [999] }], saved.map),
    ).toMatch(/spine/);
    expect(mountainRangeFactsError([], saved.map)).toBeNull();
  });
  it('shares stored names across prose, UI, map and edits and protects authored dependents on removal', () => {
    const snapshot = fixtureSnapshot(),
      range = snapshot.facts.mountainRanges[0];
    const renamed = setRegionResourceFactText(
      snapshot,
      'mountainRanges',
      range.id,
      'name',
      'The Copper Range',
    );
    expect(renamed.facts.mountainRanges[0].origin).toBe('authored');
    expect(renamed.facts.mountainRanges[0].spineNodeIds).toEqual(range.spineNodeIds);
    expect(regionToMarkdown(renamed)).toContain('The Copper Range');
    expect(regionToText(renamed)).toContain('The Copper Range');
    expect(regionToExportDocument(renamed)).toEqual(regionToDocument(renamed));
    expect(regionToMapSvg(renamed)).toContain('The Copper Range');
    expect(
      regionToDocument(renamed).sections.find((section) => section.heading === 'Landscape')
        ?.factIds,
    ).toContain(range.id);
    expect(
      regionToUiDocument(renamed).sections.find((section) => section.heading === 'Landscape')
        ?.entries[0].heading,
    ).toBe('The Copper Range');
    const edited = setRegionResourceFactText(
      renamed,
      'mountainRanges',
      range.id,
      'description',
      'My range description.',
    );
    expect(regionToMarkdown(edited)).toContain('My range description.');
    const removed = removeRegionResourceFact(edited, 'mountainRanges', range.id);
    expect(removed.facts.mountainRanges).toEqual([]);
    expect(regionToMapSvg(removed)).not.toContain('data-range-id=');
    expect(removed.map).toEqual(snapshot.map);
    const linked = {
      ...snapshot,
      facts: {
        ...snapshot.facts,
        claims: [
          {
            id: 'claim:range',
            name: 'Authored',
            description: 'Keep me',
            origin: 'authored' as const,
            subjectId: range.id,
            relatedIds: [],
          },
        ],
      },
    };
    expect(removeRegionResourceFact(linked, 'mountainRanges', range.id)).toBe(linked);
    const staled = setRegionResourceFactText(
      {
        ...linked,
        facts: {
          ...linked.facts,
          claims: [
            {
              ...linked.facts.claims[0],
              reason: {
                ruleId: 'test',
                status: 'current' as const,
                sources: [{ kind: 'fact' as const, factId: range.id }],
              },
            },
          ],
        },
      },
      'mountainRanges',
      range.id,
      'name',
      'Changed',
    );
    expect(staled.facts.claims[0].reason?.status).toBe('stale');
    expect(validateRegionSnapshot(renamed).ok).toBe(true);
  });
  it('validates authored geographic invariants independently from authored descriptions', () => {
    const { map, facts } = subject();
    generateMountainRangeFacts({ map, facts, dominantCulture: null }, new RNG('range'));
    const authored: MountainRangeFact = {
      ...facts.mountainRanges[0],
      origin: 'authored',
      reason: undefined,
    };
    expect(mountainRangeFactsError([authored], map)).toBeNull();
    map.nodes[authored.spineNodeIds[1]].isWater = true;
    expect(mountainRangeFactsError([authored], map)).toMatch(/invalid mountain/);
  });
});
