/** Review the same deterministic compositions and vector artwork used by region maps. */
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  CAPITAL_PENNANT,
  SETTLEMENT_BUILDING_VARIANTS,
  SETTLEMENT_ICON_PROFILES,
  composeSettlementIcon,
  capitalPennantAnchor,
  inkStrokePath,
  type MapNode,
  type RegionMap,
} from '../src/lib/map';
import { CARTOGRAPHY } from '../src/lib/cartography';

const { values } = parseArgs({
  options: { out: { type: 'string', default: 'settlement-icons.svg' } },
});
const paper = CARTOGRAPHY.ground.fill,
  ink = CARTOGRAPHY.palette.body.color;
const node: MapNode = {
  id: 1,
  center: { x: 20, y: 15 },
  polygon: { vertices: [], edges: [] },
  neighbors: [],
  edges: [],
  corners: [],
  elevation: 0.3,
  moisture: 0.5,
  temperature: 15,
  isWater: false,
  isOcean: false,
  isCoast: false,
};
const map: RegionMap = { width: 40, height: 30, nodes: [node], edges: [], corners: [] };
const defs = [...SETTLEMENT_BUILDING_VARIANTS.map((v) => v.artwork), CAPITAL_PENNANT]
  .map(
    (art) =>
      `<g id="${art.id}"><path d="${art.bodyPaths.join(' ')}" fill="${paper}"/><path d="${art.strokes.map(inkStrokePath).join(' ')}" fill="${ink}"/></g>`,
  )
  .join('');
const elements = [
  `<rect width="1200" height="1300" fill="${paper}"/><defs>${defs}</defs>`,
  `<g fill="${ink}" font-family="Georgia,serif"><text x="30" y="40" font-size="26">Settlement icons — implemented compositions</text><text x="30" y="70" font-size="15">Three identities per category · ordinary / capital pairs · enlarged and map-scale copies</text></g>`,
];
for (const [row, profile] of SETTLEMENT_ICON_PROFILES.entries()) {
  const y = 120 + row * 185;
  elements.push(
    `<text x="30" y="${y}" fill="${ink}" font-family="Georgia,serif" font-size="20">${profile.category}</text>`,
  );
  for (let identity = 0; identity < 3; identity++)
    for (const isCapital of [false, true]) {
      const icon = composeSettlementIcon(map, node, {
        id: `specimen:${identity}`,
        category: profile.category,
        isCapital,
      });
      const buildings = icon.buildings
        .map(
          (b) =>
            `<use href="#${b.variantId}" transform="translate(${b.anchor.x} ${b.anchor.y}) scale(${b.scale})"/>`,
        )
        .join('');
      const pennant = capitalPennantAnchor(icon);
      const capital = isCapital
        ? `<use href="#${CAPITAL_PENNANT.id}" transform="translate(${pennant.x} ${pennant.y})"/>`
        : '';
      const x = 205 + identity * 325 + Number(isCapital) * 155;
      const width = icon.bounds.maxX - icon.bounds.minX;
      const scale = Math.min(125 / width, 105 / -icon.bounds.minY);
      elements.push(
        `<g transform="translate(${x} ${y + 115}) scale(${scale})">${buildings}${capital}</g>`,
        `<g transform="translate(${x} ${y + 154}) scale(${(profile.targetHalfWidthFactor * 12) / width})">${buildings}${capital}</g>`,
      );
    }
}
writeFileSync(
  values.out!,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1300" viewBox="0 0 1200 1300">${elements.join('\n')}</svg>`,
);
console.log(`Wrote settlement specimens to ${values.out}`);
