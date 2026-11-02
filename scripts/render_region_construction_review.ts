/** Render actual region output, optionally alongside a captured pre-change region snapshot. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { create } from 'xmlbuilder2';
import { rollRegionSnapshot, type RegionSnapshot } from '../src/lib/regions';
import {
  buildSettlementPanorama,
  renderSettlementPanorama,
} from '../src/lib/settlement_illustration';
const { values } = parseArgs({
  options: {
    seed: { type: 'string', default: 'alpha' },
    out: { type: 'string', default: '/tmp/regional-construction-review' },
    before: { type: 'string' },
  },
});
const seed = values.seed!;
const out = resolve(values.out!);
mkdirSync(out, { recursive: true });
const after = rollRegionSnapshot(seed);
const versions: { label: string; region: RegionSnapshot }[] = [];
if (values.before)
  versions.push({
    label: 'Before',
    region: JSON.parse(readFileSync(values.before, 'utf8')) as RegionSnapshot,
  });
versions.push({ label: 'After', region: after });
const first = after.settlements[0];
if (!first) throw new Error('The sampled region has no settlements');
const sheet = create().ele('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 1040,
  height: versions.length * 365 + 55,
  viewBox: `0 0 1040 ${versions.length * 365 + 55}`,
});
sheet.ele('rect', { width: '100%', height: '100%', fill: '#f6f1e8' });
sheet
  .ele('text', { x: 20, y: 30, 'font-family': 'Georgia, serif', 'font-size': 20, fill: '#4a3d32' })
  .txt(`Region seed: ${seed} · ${first.snapshot.name}`);
for (const [index, { label, region }] of versions.entries()) {
  const entry = region.settlements.find((s) => s.id === first.id);
  if (!entry) throw new Error(`Missing settlement ${first.id} in ${label}`);
  const s = entry.snapshot;
  const scene = buildSettlementPanorama({
    ...s,
    biome: s.environment.biome,
    terrain: s.environment.terrain,
  });
  const svg = renderSettlementPanorama(scene);
  writeFileSync(resolve(out, `${seed}-${label.toLowerCase()}.svg`), svg);
  const y = 55 + index * 365;
  sheet
    .ele('text', {
      x: 20,
      y: y + 24,
      'font-family': 'Georgia, serif',
      'font-size': 18,
      fill: '#4a3d32',
    })
    .txt(
      `${label} · ${s.category.name} · ${s.environment.biome.name} · ${scene.buildings.length} buildings`,
    );
  const group = sheet.ele('g', { transform: `translate(20 ${y + 38})` });
  group.import(create(svg).root());
}
writeFileSync(resolve(out, `${seed}-comparison.svg`), sheet.end({ headless: true }));
console.log(
  JSON.stringify({
    seed,
    settlements: after.settlements.length,
    drawable: after.settlements.filter((e) => e.snapshot.architecture.examples.length).length,
    out,
  }),
);
