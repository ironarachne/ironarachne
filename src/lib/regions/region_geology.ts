import type { RNG } from '@ironarachne/rng';
import { generateGeologicalSetting } from '$lib/environment';
import type Region from './region';

/** Four coarse provinces covering all dry land; no continuity or tectonic history is asserted. */
export function generateGeologyFacts(
  region: Pick<Region, 'map' | 'facts' | 'environment'>,
  rng: RNG,
): void {
  const facts = region.facts;
  const land = region.map.nodes
    .filter((node) => !node.isOcean && !node.isWater)
    .sort((a, b) => a.center.x - b.center.x || a.center.y - b.center.y || a.id - b.id);
  if (!facts || !land.length) return;
  const makeup = region.environment.terrain.geologicalMakeup;
  const count = Math.min(4, land.length);
  for (let index = 0; index < count; index++) {
    const nodes = land.slice(
      Math.floor((index * land.length) / count),
      Math.floor(((index + 1) * land.length) / count),
    );
    const nodeIds = nodes.map((node) => node.id).sort((a, b) => a - b);
    const areas = facts.areas.filter((area) => area.mapNodeIds.some((id) => nodeIds.includes(id)));
    if (!areas.length) continue;
    const setting = generateGeologicalSetting(makeup, rng);
    facts.geology.push({
      id: `geology:province:${index + 1}`,
      name: `Geological province ${index + 1}`,
      description: `A generated ${setting.hostRocks.join(', ') || 'unclassified'} assemblage forms this coarse material zone; separated patches may share it.`,
      origin: 'generated',
      areaIds: areas.map((area) => area.id).sort(),
      anchor: { nodeIds, edgeIds: [] },
      setting,
      reason: {
        ruleId: 'fantasy:region:geological-province:v1',
        status: 'current',
        sources: [
          ...areas.map((area) => ({ kind: 'fact' as const, factId: area.id })),
          {
            kind: 'environment',
            field: 'terrain',
            observedValue: JSON.stringify({
              ...region.environment.terrain,
              geologicalMakeup: {
                rockTypes: [...makeup.rockTypes].sort(),
                soilTypes: [...makeup.soilTypes].sort(),
              },
            }),
          },
          ...nodes.map((node) => ({
            kind: 'map-node' as const,
            nodeId: node.id,
            property: 'elevation' as const,
            observedValue: String(node.elevation),
          })),
        ],
      },
    });
  }
}
