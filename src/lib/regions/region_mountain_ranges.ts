import type { RNG } from '@ironarachne/rng';
import { classifyRegionLandforms, detectMountainRanges, type MapNode } from '$lib/map';
import { composeNarrative, type NarrativeContext, type NarrativeSubject } from '$lib/narrative';
import {
  generateLandscapeName,
  nameGeneratorSetToStoredPatternSet,
  type LandscapeNameContext,
} from '$lib/names';
import type Region from './region';
import type { FactSource } from './region_fact_types';
import { namingDirections } from './region_landscape_names';

function rangeSubject(id: string, nodes: MapNode[], region: Pick<Region, 'map'>): NarrativeSubject {
  const directions = namingDirections(nodes, region.map);
  const location = directions.at(-1)?.replace('central', 'center') ?? '';
  const forms = classifyRegionLandforms(region.map).byNodeId;
  const high =
    nodes.filter((node) => forms.get(node.id) === 'highMountain').length * 3 >= nodes.length * 2;
  return {
    id,
    kind: 'mountain-range',
    candidates: [
      {
        id: `${id}:ridge`,
        topic: 'relief',
        importance: 'defining',
        sourceIds: [id],
        templates: [
          {
            id: 'linked-ridge',
            parts: [
              {
                id: 'ridge',
                options: [
                  'Linked mountain ridges form a continuous range.',
                  'A chain of mountain ridges stretches through this landscape.',
                ],
              },
            ],
          },
        ],
      },
      ...(high
        ? [
            {
              id: `${id}:high`,
              topic: 'height',
              importance: 'distinctive' as const,
              sourceIds: [id],
              templates: [
                {
                  id: 'high-relief',
                  parts: [
                    {
                      id: 'height',
                      options: [
                        'High mountains dominate the range.',
                        'Most of the range rises into high mountain terrain.',
                      ],
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      ...(location
        ? [
            {
              id: `${id}:location`,
              topic: 'location',
              importance: 'supporting' as const,
              sourceIds: [id],
              templates: [
                {
                  id: 'supported-location',
                  parts: [
                    {
                      id: 'location',
                      options: [
                        location === 'center'
                          ? 'It lies in the center of the region.'
                          : `It lies in the ${location} of the region.`,
                      ],
                    },
                  ],
                },
              ],
            },
          ]
        : []),
    ],
  };
}

/** Geometry is deterministic; only eligible names and saved wording consume this stage's RNG. */
export function generateMountainRangeFacts(
  region: Pick<Region, 'map' | 'facts' | 'dominantCulture'>,
  rng: RNG,
): void {
  const facts = region.facts;
  if (!facts) return;
  const ranges = detectMountainRanges(region.map);
  const culturePatterns = region.dominantCulture
    ? nameGeneratorSetToStoredPatternSet(region.dominantCulture.nameGenerators)
    : undefined;
  let naming: LandscapeNameContext = {
    usedNames: [...facts.areas, ...facts.mountainRanges].map((fact) => fact.name),
    recentStyles: [],
  };
  let narrative: NarrativeContext = { recentSelections: [] };
  // Include the whole elevation baseline and every possible flank witness, not just chosen cells.
  const sources: FactSource[] = [...region.map.nodes]
    .sort((a, b) => a.id - b.id)
    .flatMap((node) =>
      (['elevation', 'isWater', 'isOcean'] as const).map((property) => ({
        kind: 'map-node' as const,
        nodeId: node.id,
        property,
        observedValue: String(node[property]),
      })),
    );
  for (const geometry of ranges) {
    const id = `range:mountain:${geometry.mapNodeIds[0]}`;
    const membership = new Set(geometry.mapNodeIds);
    const nodes = region.map.nodes
      .filter((node) => membership.has(node.id))
      .sort((a, b) => a.id - b.id);
    const named = generateLandscapeName(
      {
        id,
        scope: 'zone',
        nouns: ['Range', 'Mountain Range'],
        directions: namingDirections(nodes, region.map),
        culturePatterns,
      },
      naming,
      rng,
    );
    naming = named.nextContext;
    const described = composeNarrative(
      rangeSubject(id, nodes, region),
      { maxSentences: 3, maxPerTopic: 1, repetitionWindow: 8 },
      narrative,
      rng,
    );
    narrative = described.nextContext;
    facts.mountainRanges.push({
      ...geometry,
      id,
      name: named.name,
      description: described.text,
      origin: 'generated',
      reason: {
        ruleId: 'fantasy:region:mountain-range:v1',
        status: 'current',
        sources,
      },
    });
  }
}
