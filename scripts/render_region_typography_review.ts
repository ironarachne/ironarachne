import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  typographyRiverFixture,
  typographyPlacesFixture,
  typographyRangeFixture,
  typographyForestFixture,
} from '../test_fixtures/region_typography';
import { buildRegionMapSvgString } from '../src/lib/map';
import { rollRegionSnapshot, regionToMapSvg } from '../src/lib/regions';
const out = process.argv[2] ?? '/tmp/region-typography-418';
mkdirSync(out, { recursive: true });
for (const seed of process.argv.includes('--controlled-only')
  ? []
  : ['alpha', 'bravo', 'charlie']) {
  const path = `${out}/${seed}.json`;
  const snapshot = existsSync(path)
    ? JSON.parse(readFileSync(path, 'utf8'))
    : rollRegionSnapshot(seed);
  writeFileSync(path, JSON.stringify(snapshot));
  writeFileSync(`${out}/${seed}-${process.argv[3] ?? 'after'}.svg`, regionToMapSvg(snapshot));
}

for (const [name, fixture] of [
  ['river', typographyRiverFixture()],
  ['legacy-river', typographyRiverFixture(false)],
  ['places', typographyPlacesFixture()],
  ['range', typographyRangeFixture()],
  ['forest', typographyForestFixture()],
] as const) {
  writeFileSync(
    `${out}/${name}-${process.argv[3] ?? 'after'}.svg`,
    buildRegionMapSvgString(fixture.map, fixture.options),
  );
}
