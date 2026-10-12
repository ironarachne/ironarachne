import { RNG } from '@ironarachne/rng';
import { getDefaultConfig } from '../src/lib/regions';
import { getAllFantasyNameGeneratorSets } from '../src/lib/names';
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { performance } from 'node:perf_hooks';
import {
  buildRegionMapSvgString,
  detectMountainRanges,
  classifyRegionLandforms,
  measureRegionTerrain,
  mountainRangeCandidates,
  mountainRangeGeometryError,
} from '../src/lib/map';
import { rollRegionSnapshot, regionToMapSvg, regionToMarkdown } from '../src/lib/regions';

import { mountainRangeFixture } from './region_mountain_range_fixture';

function main() {
  const { values } = parseArgs({
    options: {
      out: { type: 'string', default: '/tmp/region-mountain-ranges' },
    },
  });
  const out = values.out!;
  mkdirSync(out, { recursive: true });
  const metrics: object[] = [];
  const measure = (label: string, before: () => string, after: () => string) => {
    const original = before(),
      updated = after();
    writeFileSync(`${out}/${label}-before.svg`, original);
    writeFileSync(`${out}/${label}-after.svg`, updated);
    const times = (render: () => string) => {
      render();
      return Array.from({ length: 5 }, () => {
        const start = performance.now();
        render();
        return performance.now() - start;
      }).sort((a, b) => a - b)[2];
    };
    metrics.push({
      label,
      beforeBytes: Buffer.byteLength(original),
      afterBytes: Buffer.byteLength(updated),
      beforeMs: times(before),
      afterMs: times(after),
      rangeMarks: (updated.match(/data-range-id=/g) ?? []).length,
      saddles: (updated.match(/data-range-saddle=/g) ?? []).length,
    });
  };
  for (const [label, curved, lake] of [
    ['straight', false, false],
    ['curved', true, false],
    ['lake-gap', true, true],
  ] as const) {
    const map = mountainRangeFixture(curved, lake);
    const ranges = detectMountainRanges(map).map((range, i) => ({
      ...range,
      id: `range:mountain:${range.mapNodeIds[0]}`,
      name: ['The Ragged Range', 'The Eastern Range'][i],
    }));
    const options = {
      title: 'Mountain ranges — controlled terrain',
      settlements: [
        {
          id: 'settlement:1',
          mapNodeId: 205,
          name: 'Lowford',
          population: 100,
          category: 'village' as const,
        },
      ],
    };
    measure(
      label,
      () => buildRegionMapSvgString(map, options),
      () => buildRegionMapSvgString(map, { ...options, mountainRanges: ranges }),
    );
    writeFileSync(`${out}/${label}-ranges.json`, JSON.stringify(ranges, null, 2));
  }
  const seeds = [
    'alpha',
    'bravo',
    'charlie',
    ...Array.from({ length: 30 }, (_, i) => `mountain-range-${i + 1}`),
  ];
  const survey = [];
  for (const seed of seeds) {
    const snapshot = rollRegionSnapshot(seed);
    // Mirror the documented rollRegion seed-owner boundary solely to report requested profiles.
    const root = new RNG(seed);
    getDefaultConfig(root);
    root.item(getAllFantasyNameGeneratorSets(root));
    const physical = new RNG(
      JSON.stringify(['region-passes-v1', root.randomString(32), 'physical-geography']),
    );
    const requested = {
      altitude: physical.item(['low', 'mid', 'high']),
      relief: physical.item(['flat', 'hilly', 'mountainous']),
    };
    const candidates = mountainRangeCandidates(snapshot.map).map((range) => ({
      ...range,
      rejection: mountainRangeGeometryError(snapshot.map, range, true),
    }));
    survey.push({
      seed,
      requested,
      candidates,
      terrain: measureRegionTerrain(snapshot.map),
      mountainCells: [...classifyRegionLandforms(snapshot.map).byNodeId.values()].filter(
        (form) => form === 'mountain' || form === 'highMountain',
      ).length,
      ranges: snapshot.facts.mountainRanges,
    });
    if (
      seed === 'alpha' ||
      seed === 'bravo' ||
      seed === 'charlie' ||
      snapshot.facts.mountainRanges.length
    ) {
      const without = { ...snapshot, facts: { ...snapshot.facts, mountainRanges: [] } };
      measure(
        seed,
        () => regionToMapSvg(without),
        () => regionToMapSvg(snapshot),
      );
      writeFileSync(`${out}/${seed}.md`, regionToMarkdown(snapshot));
      writeFileSync(`${out}/${seed}.json`, JSON.stringify(snapshot));
    }
  }
  writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 2));
  writeFileSync(`${out}/survey.json`, JSON.stringify(survey, null, 2));
  console.log(JSON.stringify(metrics, null, 2));
  console.log(survey.map(({ seed, ranges }) => `${seed}: ${ranges.length} ranges`).join('\n'));
}

main();
