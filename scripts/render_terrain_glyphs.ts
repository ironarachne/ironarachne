/** Render the authored terrain catalog for visual review, without generating or changing geography. */
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { TERRAIN_GLYPHS, inkStrokePath } from '../src/lib/map';
import { CARTOGRAPHY } from '../src/lib/cartography';

const { values } = parseArgs({
  options: { out: { type: 'string', default: 'terrain-glyphs.svg' } },
});
const paper = CARTOGRAPHY.ground.fill,
  ink = CARTOGRAPHY.palette.body.color;
const labels = [
  'High mountains',
  'Mountains',
  'Hills',
  'Deciduous trees',
  'Conifers',
  'Palms',
  'Marsh',
  'Prairie',
  'Desert dunes',
  'Desert rocks',
  'Desert cacti',
  'Oasis vegetation',
];
const height = 170 + Object.keys(TERRAIN_GLYPHS).length * 145;
const elements = [
  `<rect width="1200" height="${height}" fill="${paper}"/>`,
  `<g fill="${ink}" font-family="Georgia,serif"><text x="40" y="45" font-size="28">Terrain glyphs — implemented vector catalog</text><text x="40" y="75" font-size="15">Four authored variants per family · tapered ink ribbons · enlarged and small-scale checks</text></g>`,
];
for (const [row, definition] of Object.values(TERRAIN_GLYPHS).entries()) {
  const y = 120 + row * 145;
  elements.push(
    `<path d="M 40 ${y + 123} H 1160" stroke="${ink}" opacity="0.15"/>`,
    `<text x="40" y="${y + 20}" fill="${ink}" font-family="Georgia,serif" font-size="18">${labels[row]}</text>`,
  );
  for (const [index, variant] of definition.variants.entries()) {
    const art = `<path d="${variant.bodyPaths.join(' ')}" fill="${paper}"/><path d="${variant.strokes.map(inkStrokePath).join(' ')}" fill="${ink}"/>`;
    elements.push(
      `<g transform="translate(${275 + index * 145} ${y + 106}) scale(32)">${art}</g>`,
      `<g transform="translate(${905 + index * 62} ${y + 90}) scale(11)">${art}</g>`,
    );
  }
}
writeFileSync(
  values.out!,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">${elements.join('\n')}</svg>`,
);
console.log(`Wrote terrain specimens to ${values.out}`);
