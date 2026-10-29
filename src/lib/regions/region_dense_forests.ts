import type { RNG } from '@ironarachne/rng';
import { detectDenseForests } from '$lib/map';
import { generateLandscapeName, nameGeneratorSetToStoredPatternSet } from '$lib/names';
import type Region from './region';
import type { FactSource, NotableFact } from './region_fact_types';
import { namingDirections } from './region_landscape_names';

export function generateDenseForestFacts(region: Pick<Region, 'map' | 'facts'>): void {
  if (!region.facts) return;
  const sources: FactSource[] = [...region.map.nodes]
    .sort((a, b) => a.id - b.id)
    .flatMap((node) =>
      (['biomeId', 'moisture', 'elevation', 'isWater', 'isOcean'] as const).map((property) => ({
        kind: 'map-node' as const,
        nodeId: node.id,
        property,
        observedValue: String(node[property]),
      })),
    );
  region.facts.denseForests = detectDenseForests(region.map).map((geometry) => ({
    ...geometry,
    id: `forest:dense:${geometry.mapNodeIds[0]}`,
    name: 'Dense forest',
    description: 'A dense mass of trees occupies part of the surrounding woodland.',
    origin: 'generated',
    reason: { ruleId: 'fantasy:region:dense-forest:v1', status: 'current', sources },
  }));
}

/** The caller owns a dedicated stream; selecting a forest never advances other notable draws. */
export function generateDenseForestLandmark(region: Region, rng: RNG): NotableFact | undefined {
  const facts = region.facts;
  const eligible = facts?.denseForests.filter((fact) => fact.reason?.status !== 'stale');
  if (!facts || !eligible?.length) return undefined;
  const forest = rng.item(eligible);
  const nodes = region.map.nodes
    .filter((node) => forest.mapNodeIds.includes(node.id))
    .sort((a, b) => a.id - b.id);
  const named = generateLandscapeName(
    {
      id: forest.id,
      scope: 'zone',
      nouns: ['Wood', 'Forest'],
      directions: namingDirections(nodes, region.map),
      culturePatterns: region.dominantCulture
        ? nameGeneratorSetToStoredPatternSet(region.dominantCulture.nameGenerators)
        : undefined,
    },
    {
      usedNames: [...facts.areas, ...facts.mountainRanges, ...facts.notables].map(
        (fact) => fact.name,
      ),
      recentStyles: [],
    },
    rng,
  );
  forest.name = named.name;
  return {
    id: `landmark:${forest.id}`,
    kind: 'landmark',
    name: forest.name,
    description: `${forest.description} Hook: Survey the edge of this forest and compare its dense canopy with the surrounding woodland.`,
    origin: 'generated',
    areaIds: facts.areas
      .filter((area) => area.mapNodeIds.some((id) => forest.mapNodeIds.includes(id)))
      .map((area) => area.id),
    anchor: { nodeIds: [...forest.mapNodeIds], edgeIds: [] },
    reason: {
      ruleId: 'fantasy:region:dense-forest-landmark:v1',
      status: 'current',
      sources: [{ kind: 'fact', factId: forest.id }],
    },
  };
}
