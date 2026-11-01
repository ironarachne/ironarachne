import { emptyRegionHistory } from './region_realm_identity';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import {
  buildLandscapePlaces,
  landscapeReadingCandidates,
  landscapePlaceCurrent,
} from './region_landscape_reading';
import { landscapeFootprintObservation, landscapeExtent } from './region_landscape_extent';
import { generateRegionGazetteer, composeRegionGazetteer } from './region_editorial';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { regionGazetteerError } from './region_editorial_validation';
import { landscapeObservationError } from './region_landscape_validation';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { setRegionResourceFactText, removeRegionResourceFact } from './region_resource_editing';
import type { FactBase } from './region_fact_types';
import type { LandscapeFootprintObservation } from './region_landscape_reading_types';

const base = rollRegionSnapshot('446-base');
const fact = (id: string, name: string): FactBase => ({
  id,
  name,
  description: 'Saved source prose.',
  origin: 'generated',
  reason: {
    ruleId: 'fixture:v1',
    status: 'current',
    sources: [{ kind: 'map-node', nodeId: 1, property: 'isWater', observedValue: 'false' }],
  },
});
function fixture() {
  const snapshot = structuredClone(base);
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  snapshot.description = '';
  snapshot.settlements = [];
  snapshot.facts = emptyRegionFacts('current');
  snapshot.map.width = 300;
  snapshot.map.height = 300;
  snapshot.map.nodes = Array.from({ length: 30 }, (_, i) => ({
    ...base.map.nodes[0],
    id: i + 1,
    center: { x: 10 + (i % 10) * 28, y: 10 + Math.floor(i / 10) * 130 },
    neighbors: [i, i + 2].filter((id) => id > 0 && id <= 30),
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate deciduous forest',
  }));
  snapshot.facts.areas = [
    {
      ...fact('area:land', 'Regional land'),
      description: 'Rolling woodland country.',
      mapNodeIds: snapshot.map.nodes.map((node) => node.id),
    },
    {
      ...fact('area:habitat-zone:1', 'The Weald'),
      mapNodeIds: snapshot.map.nodes.slice(0, 25).map((node) => node.id),
    },
    { ...fact('area:habitat-zone:30', 'Tiny Copse'), mapNodeIds: [30] },
  ];
  snapshot.facts.denseForests = [
    { ...fact('forest:dense:1', 'Unquiet Forest'), mapNodeIds: [1, 2, 3] },
    { ...fact('forest:dense:4', 'Dense forest'), mapNodeIds: [4, 5, 6] },
    { ...fact('forest:dense:7', 'Dense forest'), mapNodeIds: [7, 8, 9] },
  ];
  snapshot.facts.notables = [
    {
      ...fact('landmark:forest:dense:1', 'Unquiet Forest'),
      kind: 'landmark',
      description: 'Copied forest prose. Hook: Survey its edge.',
      areaIds: ['area:land'],
      anchor: { nodeIds: [1, 2, 3], edgeIds: [] },
      reason: {
        ruleId: 'forest-landmark:v1',
        status: 'current',
        sources: [{ kind: 'fact', factId: 'forest:dense:1' }],
      },
    },
  ];
  return snapshot;
}
function generated(snapshot = fixture()) {
  const region = regionFromSnapshot(snapshot, new RNG('restore'));
  generateRegionGazetteer(region, new RNG('446'));
  return toRegionSnapshot(region);
}
function observation(
  points: [number, number][],
  land = 30,
  neighbors = true,
): LandscapeFootprintObservation {
  return {
    kind: 'landscape-footprint',
    footprints: [{ factId: 'patch', nodeIds: points.map((_, i) => i + 1) }],
    landNodeIds: Array.from({ length: land }, (_, i) => i + 1),
    mapWidth: 300,
    mapHeight: 300,
    cells: points.map(([x, y], i) => ({
      nodeId: i + 1,
      x,
      y,
      neighborIds: neighbors ? [i, i + 2].filter((id) => id > 0 && id <= points.length) : [],
    })),
  };
}

describe('landscape extent policy', () => {
  it('gives broad coverage precedence over a centroid and qualifies disconnected coverage', () => {
    const obs = observation(
      Array.from({ length: 148 }, (_, i) => [i % 2 ? 10 : 290, 150]),
      178,
    );
    expect(landscapeExtent(obs)?.phrase).toBe('covers much of the region');
    obs.cells.forEach((cell) => (cell.neighborIds = []));
    expect(landscapeExtent(obs)?.phrase).toBe('covers much of the region in separate stretches');
  });
  it('requires concentration for corners and center, with exact boundaries in the middle band', () => {
    expect(
      landscapeExtent(
        observation([
          [10, 10],
          [20, 20],
          [290, 290],
        ]),
      )?.phrase,
    ).toBe('lies mainly in the northwest');
    expect(
      landscapeExtent(
        observation([
          [100, 100],
          [200, 200],
          [150, 150],
        ]),
      )?.phrase,
    ).toBe('lies mainly in the center');
    expect(
      landscapeExtent(
        observation([
          [10, 150],
          [290, 150],
          [150, 10],
          [150, 290],
        ]),
      )?.phrase,
    ).toBe('stretches across several parts of the region');
  });
  it('describes connected spans and disconnected patches without inventing a corridor', () => {
    expect(
      landscapeExtent(
        observation([
          [10, 150],
          [150, 150],
        ]),
      )?.phrase,
    ).toBe('extends from the west into the center');
    expect(
      landscapeExtent(
        observation(
          [
            [150, 10],
            [150, 290],
          ],
          30,
          false,
        ),
      )?.phrase,
    ).toBe('forms separate patches in the north and south');
    expect(
      landscapeExtent(
        observation(
          [
            [10, 10],
            [290, 10],
            [290, 290],
            [10, 290],
          ],
          30,
          false,
        ),
      )?.phrase,
    ).toBe('forms separate patches across several parts of the region');
  });
  it('rejects unresolved and invalid footprints and measures tiny patches proportionately', () => {
    const obs = observation([[10, 10]]);
    expect(landscapeExtent(obs)).toMatchObject({ small: true, count: 1 });
    obs.footprints[0].nodeIds = [99];
    expect(landscapeExtent(obs)).toBeUndefined();
    obs.footprints[0].nodeIds = [];
    expect(landscapeExtent(obs)).toBeUndefined();
    obs.footprints[0].nodeIds = [1];
    obs.mapWidth = 0;
    expect(landscapeExtent(obs)).toBeUndefined();
  });
});

describe('saved landscape reading hierarchy', () => {
  it('gives aliases one owner, keeps all named places discoverable and caps geographic prose', () => {
    const source = fixture();
    const result = generated(source);
    expect(result.gazetteer?.version).toBe(6);
    expect(result.facts).toEqual(source.facts);
    expect(result.map).toEqual(source.map);
    expect(regionGazetteerError(result.gazetteer, result)).toBeNull();
    if (result.gazetteer?.version !== 6) throw new Error('Missing registry');
    expect(
      result.gazetteer.landscapePlaces.find((place) => place.id === 'forest:dense:1'),
    ).toMatchObject({
      owner: 'notable-place',
      primaryFactId: 'landmark:forest:dense:1',
      aliasFactIds: ['forest:dense:1'],
    });
    const document = regionToDocument(result);
    expect(
      document.sections
        .find((section) => section.heading === 'Landscape')
        ?.landscapeReferences?.map((reference) => reference.label),
    ).toEqual(['The Weald', 'Tiny Copse', 'Unquiet Forest']);
    const geographic = result.gazetteer.blocks.filter((block) =>
      ['landscape', 'notable-place'].includes(block.destination.section),
    );
    expect(geographic.flatMap((block) => block.sentences).length).toBeLessThanOrEqual(3);
    expect(geographic.every((block) => block.sentences.length === 1)).toBe(true);
    const text = regionToText(result);
    expect(text).not.toContain('Copied forest prose');
    expect(text).not.toContain('Saved source prose');
    expect(text).not.toMatch(/\(.*Entry\)/);
    expect(text).toContain('covers much of the region');
    const entries = regionToUiDocument(result).sections.flatMap((section) => section.entries);
    expect(entries.filter((entry) => entry.heading === 'Unquiet Forest')).toHaveLength(1);
    expect(entries.find((entry) => entry.heading === 'Tiny Copse')?.body).toBe('');
  });
  it('groups only indistinguishable significant unnamed patches and omits minor texture', () => {
    const source = fixture();
    source.map.nodes.slice(3, 9).forEach((node) => (node.center = { x: 20, y: 20 }));
    const places = buildLandscapePlaces(source);
    expect(places.find((place) => place.id === 'forest:dense:4')).toMatchObject({
      descriptor: 'Dense forest patches',
      aliasFactIds: ['forest:dense:7'],
    });
    source.facts.denseForests[1].mapNodeIds = [4];
    source.facts.denseForests[2].mapNodeIds = [7, 8];
    expect(buildLandscapePlaces(source).filter((place) => place.descriptor)).toEqual([]);
    expect(buildLandscapePlaces(source).some((place) => place.id === 'area:habitat-zone:30')).toBe(
      true,
    );
  });
  it('uses explicit aliases rather than overlap or names and rejects ambiguous promotions', () => {
    const source = fixture();
    source.facts.notables[0].reason = structuredClone(source.facts.denseForests[0].reason);
    expect(buildLandscapePlaces(source).find((place) => place.id === 'forest:dense:1')?.owner).toBe(
      'landscape',
    );
    source.facts.notables[0].reason = {
      ruleId: 'alias:v1',
      status: 'current',
      sources: [{ kind: 'fact', factId: 'forest:dense:1' }],
    };
    source.facts.notables.push({ ...structuredClone(source.facts.notables[0]), id: 'ambiguous' });
    expect(buildLandscapePlaces(source).find((place) => place.id === 'forest:dense:1')?.owner).toBe(
      'landscape',
    );
  });
  it('canonicalizes footprints and generation without consuming RNG while reading', () => {
    const source = fixture();
    const reversed = structuredClone(source);
    reversed.map.nodes.reverse();
    reversed.map.nodes.forEach((node) => node.neighbors.reverse());
    reversed.facts.areas.reverse();
    reversed.facts.denseForests.reverse();
    for (const area of reversed.facts.areas) area.mapNodeIds.reverse();
    expect(landscapeFootprintObservation(reversed, ['area:habitat-zone:1'])).toEqual(
      landscapeFootprintObservation(source, ['area:habitat-zone:1']),
    );
    expect(generated(source).gazetteer).toEqual(generated(reversed).gazetteer);
    const snapshot = generated();
    const before = structuredClone(snapshot);
    const spy = vi.spyOn(RNG.prototype, 'int');
    const document = regionToDocument(snapshot);
    const ui = regionToUiDocument(snapshot);
    expect(ui.paragraphs).toEqual(document.paragraphs);
    const markdown = regionToMarkdown(snapshot),
      text = regionToText(snapshot);
    for (const entry of ui.sections.flatMap((section) => section.entries))
      if (entry.body) {
        expect(markdown).toContain(entry.body);
        expect(text).toContain(entry.body);
      }
    for (const reference of document.sections.flatMap(
      (section) => section.landscapeReferences ?? [],
    ))
      expect(markdown).toContain(`[${reference.label}](#landscape-`);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(snapshot).toEqual(before);
  });
  it.each(['membership', 'denominator', 'coordinates', 'dimensions', 'topology', 'alias'] as const)(
    'invalidates changed %s without replacement prose',
    (change) => {
      const snapshot = generated();
      if (snapshot.gazetteer?.version !== 6) throw new Error('Missing registry');
      const forest = snapshot.gazetteer.landscapePlaces.find(
        (place) => place.id === 'forest:dense:1',
      )!;
      expect(landscapePlaceCurrent(snapshot, forest)).toBe(true);
      if (change === 'membership') snapshot.facts.denseForests[0].mapNodeIds.push(4);
      if (change === 'denominator') snapshot.facts.areas[0].mapNodeIds.pop();
      if (change === 'coordinates') snapshot.map.nodes[0].center.x++;
      if (change === 'dimensions') snapshot.map.width++;
      if (change === 'topology') snapshot.map.nodes[0].neighbors = [];
      if (change === 'alias') snapshot.facts.notables[0].reason!.sources = [];
      expect(landscapePlaceCurrent(snapshot, forest)).toBe(false);
      const entries = regionToUiDocument(snapshot).sections.flatMap((section) => section.entries);
      expect(entries.find((entry) => entry.heading === 'Unquiet Forest')?.body).toBe('');
    },
  );
  it('preserves separately authored aliases and blank overrides at one primary destination', () => {
    const source = generated();
    const authored = setRegionResourceFactText(
      source,
      'denseForests',
      'forest:dense:1',
      'description',
      'My forest description.',
    );
    // Imported authored notable prose uses the same reading contract as edited forests.
    const both = structuredClone(authored);
    both.facts.notables[0].origin = 'authored';
    both.facts.notables[0].description = 'My notable description.';
    const text = regionToText(both);
    expect(text.match(/My forest description\./g)).toHaveLength(1);
    expect(text.match(/My notable description\./g)).toHaveLength(1);
    const entries = regionToUiDocument(both).sections.find(
      (section) => section.heading === 'Notable places',
    )!.entries;
    expect(entries).toHaveLength(2);
    expect(new Set(entries.map((entry) => entry.anchorId)).size).toBe(2);
    expect(entries.map((entry) => entry.heading)).toEqual(['Unquiet Forest', 'Unquiet Forest']);
    const blank = setRegionResourceFactText(
      authored,
      'denseForests',
      'forest:dense:1',
      'description',
      '',
    );
    expect(regionToText(blank)).not.toContain('My forest description');
    expect(
      regionToUiDocument(blank)
        .sections.flatMap((section) => section.entries)
        .find((entry) => entry.heading === 'Unquiet Forest')?.body,
    ).toBe('');
    const removed = removeRegionResourceFact(source, 'denseForests', 'forest:dense:1');
    expect(regionGazetteerError(removed.gazetteer, removed)).toBeNull();
  });
  it('omits stale unnamed descriptors and never restores an authored blank name', () => {
    const snapshot = generated();
    if (snapshot.gazetteer?.version !== 6) throw new Error('Missing registry');
    const place = snapshot.gazetteer.landscapePlaces.find((place) => place.descriptor)!;
    snapshot.map.width++;
    expect(regionToText(snapshot)).not.toContain(place.descriptor);
    const blank = setRegionResourceFactText(
      generated(),
      'denseForests',
      'forest:dense:1',
      'name',
      '',
    );
    const notable = regionToUiDocument(blank).sections.find(
      (section) => section.heading === 'Notable places',
    );
    expect(notable?.entries[0].heading).toBe('');
    expect(
      regionToDocument(blank)
        .sections.flatMap((section) => section.landscapeReferences ?? [])
        .some((reference) => reference.placeId === 'forest:dense:1'),
    ).toBe(false);
  });

  it('keeps authored aliases readable when a stale primary record is absent', () => {
    const snapshot = generated();
    if (snapshot.gazetteer?.version !== 6) throw new Error('Missing registry');
    snapshot.facts.denseForests[0].origin = 'authored';
    snapshot.facts.denseForests[0].description = 'My retained forest.';
    snapshot.facts.notables = [];
    snapshot.gazetteer.landscapePlaces.find(
      (place) => place.id === 'forest:dense:1',
    )!.reason.status = 'stale';
    expect(regionToText(snapshot)).toContain('My retained forest.');
  });

  it('keeps sparse regions concise and version-one snapshots unchanged by migration', () => {
    const source = fixture();
    source.facts.areas = source.facts.areas.slice(0, 1);
    source.facts.denseForests = [];
    source.facts.notables = [];
    expect(
      regionToDocument(generated(source)).sections.find(
        (section) => section.heading === 'Landscape',
      ),
    ).toBeUndefined();
    source.facts.areas[0].mapNodeIds = [];
    source.map.nodes.forEach((node) => {
      node.isWater = true;
      node.isOcean = true;
    });
    expect(regionToDocument(generated(source)).paragraphs).toEqual([]);
    const old = rollRegionSnapshot('446-legacy');
    old.history = emptyRegionHistory();
    old.gazetteer = {
      version: 1,
      blocks: old.gazetteer!.blocks.filter(
        (block) =>
          !block.destination.landscapePlaceId &&
          !block.destination.notableId &&
          !block.destination.routeId &&
          block.sentences.every((sentence) =>
            sentence.observations.every(
              (observation) =>
                observation.kind === 'settlement-populations' ||
                observation.kind === 'settlement-roads',
            ),
          ),
      ),
    };
    const before = regionToText(old);
    const migrated = migrateRegionSnapshot(old, 18);
    expect(migrated).toMatchObject({ ok: true, value: old });
    if (migrated.ok) expect(regionToText(migrated.value)).toBe(before);
  });
  it('validates generated imports and rejects malformed registry, ownership and observation data', () => {
    const source = rollRegionSnapshot('446-import');
    expect(validateRegionSnapshot(source)).toMatchObject({ ok: true });
    const result = generated();
    if (result.gazetteer?.version !== 6) throw new Error('Missing registry');
    for (const mutate of [
      (snapshot: typeof result) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.landscapePlaces.push(snapshot.gazetteer.landscapePlaces[0]);
      },
      (snapshot: typeof result) => {
        snapshot.gazetteer!.blocks[0].destination.landscapePlaceId = 'missing';
      },
      (snapshot: typeof result) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.landscapePlaces[0].observations[0].mapWidth = 0;
      },
      (snapshot: typeof result) => {
        if (snapshot.gazetteer?.version === 6)
          snapshot.gazetteer.landscapePlaces[0].aliasFactIds.push(
            snapshot.gazetteer.landscapePlaces[0].primaryFactId,
          );
      },
    ]) {
      const changed = structuredClone(result);
      mutate(changed);
      expect(regionGazetteerError(changed.gazetteer, changed)).not.toBeNull();
    }
    expect(landscapeObservationError({ kind: 'landscape-footprint' })).not.toBeNull();
    expect(regionGazetteerError({ version: '2', blocks: [] }, result)).not.toBeNull();
  });
  it('applies the hierarchy to the captured historical Belvorn facts without rewriting them', () => {
    const captured = JSON.parse(
      gunzipSync(
        readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
      ).toString(),
    );
    const migrated = migrateRegionSnapshot(captured, 14);
    if (!migrated.ok) throw new Error(migrated.message);
    const source = migrated.value;
    expect(source.facts.areas.find((area) => area.name.includes('Weald'))?.mapNodeIds).toHaveLength(
      148,
    );
    expect(source.facts.areas.find((area) => area.id === 'area:land')?.mapNodeIds).toHaveLength(
      178,
    );
    const result = generated(source);
    expect(result.facts).toEqual(source.facts);
    expect(result.map).toEqual(source.map);
    const text = regionToText(result);
    expect(text).not.toMatch(/\(.*Entry\)|central part of the region/);
    const refs = regionToDocument(result).sections.flatMap(
      (section) => section.landscapeReferences ?? [],
    );
    expect(refs.some((reference) => reference.label.includes('Weald'))).toBe(true);
    expect(refs.some((reference) => reference.label.includes('Unquiet Forest'))).toBe(true);
    const pool = landscapeReadingCandidates(source, buildLandscapePlaces(source));
    expect(
      pool.find((candidate) =>
        candidate.narrative.templates[0].parts[0].options[0].includes('Weald'),
      )?.narrative.templates[0].parts[0].options[0],
    ).toContain('covers much of the region');
    const choices = composeRegionGazetteer(
      pool,
      new RNG('all-places'),
      undefined,
      buildLandscapePlaces(source),
    ).gazetteer.blocks;
    expect(choices.flatMap((block) => block.sentences)).toHaveLength(3);
  });
});
