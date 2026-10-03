import {
  classifyAltitude,
  type MapNode,
  type RegionMap,
  type AltitudeBand,
  type ReliefClass,
} from '$lib/map';
import {
  composeNarrative,
  type NarrativeCandidate,
  type NarrativeContext,
  type NarrativeResult,
  type NarrativeSubject,
} from '$lib/narrative';
import type { RNG } from '@ironarachne/rng';
import type { SettlementRoleFact } from './region_fact_types';

function median(nodes: MapNode[], property: 'temperature' | 'moisture' | 'elevation'): number {
  const values = nodes.map((node) => node[property]).sort((a, b) => a - b);
  return values[Math.max(0, Math.ceil(values.length / 2) - 1)];
}

/** Compare only other dry-land patches of the same biome, never a bog with a desert. */
function climateContrast(
  nodes: MapNode[],
  land: MapNode[],
  property: 'temperature' | 'moisture',
): string[] {
  const ids = new Set(nodes.map((node) => node.id));
  const peers = land.filter((node) => !ids.has(node.id) && node.biomeId === nodes[0].biomeId);
  if (peers.length === 0) return [];
  const difference = median(nodes, property) - median(peers, property);
  if (Math.abs(difference) < (property === 'temperature' ? 5 : 0.25)) return [];
  const local = nodes.map((node) => node[property]);
  const other = peers.map((node) => node[property]);
  if (Math.min(...local) <= Math.max(...other) && Math.min(...other) <= Math.max(...local))
    return [];
  const contrast =
    property === 'temperature'
      ? difference > 0
        ? 'warmer'
        : 'cooler'
      : difference > 0
        ? 'wetter'
        : 'drier';
  return [
    `This country is noticeably ${contrast} than other ${nodes[0].biomeId} areas in the region.`,
    `Among the region’s ${nodes[0].biomeId} landscapes, this stretch stands out as distinctly ${contrast}.`,
    `The landscape here is unusually ${contrast} compared with similar country elsewhere in the region.`,
  ];
}

function wholeSentence(
  id: string,
  topic: string,
  importance: NarrativeCandidate['importance'],
  options: string[],
  sourceIds: string[],
): NarrativeCandidate {
  return {
    id,
    topic,
    importance,
    sourceIds,
    templates: [{ id: `${id}:sentence`, parts: [{ id: 'sentence', options }] }],
  };
}

export function landscapeNarrativeSubject(
  id: string,
  biome: string,
  position: string,
  nodes: MapNode[],
  map: RegionMap,
  land: MapNode[],
  dominant?: boolean,
): NarrativeSubject {
  const sourceIds = nodes.map((node) => `map-node:${node.id}`);
  const identity =
    dominant === undefined
      ? [
          `This ${biome} landscape stretches across the ${position} part of the region.`,
          `A stretch of ${biome} occupies the region’s ${position} country.`,
          `In the ${position} part of the region, ${biome} shapes the landscape.`,
        ]
      : dominant
        ? [
            `The prevailing landscape here is ${biome}.`,
            `${biome.charAt(0).toUpperCase()}${biome.slice(1)} gives much of the region its character.`,
            `Across the region, ${biome} is the most widespread landscape.`,
          ]
        : [
            `Pockets of ${biome} lie within the wider landscape.`,
            `${biome.charAt(0).toUpperCase()}${biome.slice(1)} brings a different character to parts of the region.`,
            `The wider landscape is broken by stretches of ${biome}.`,
          ];
  const candidates = [
    wholeSentence(
      `landscape:${biome}:identity:${dominant ?? 'zone'}`,
      'identity',
      'defining',
      identity,
      sourceIds,
    ),
  ];
  const coast = nodes.some((node) => node.isCoast);
  const ids = new Set(nodes.map((node) => node.id));
  const rivers = map.edges.some(
    (edge) => edge.river > 0 && (ids.has(edge.d0) || (edge.d1 !== undefined && ids.has(edge.d1))),
  );
  if (coast || rivers) {
    const options =
      coast && rivers
        ? [
            'The land reaches the coast, with rivers threading through the landscape.',
            'Rivers run through this country on the edge of the sea.',
            'Coast and river give this landscape a close connection to water.',
          ]
        : coast
          ? [
              'It reaches the coast.',
              'The landscape meets the sea.',
              'The coast forms an edge to this country.',
            ]
          : [
              'Rivers run through the landscape.',
              'Rivers thread their way through this country.',
              'The landscape is crossed by rivers.',
            ];
    candidates.push(
      wholeSentence(
        `landscape:water:${coast}:${rivers}`,
        'water',
        'distinctive',
        options,
        sourceIds,
      ),
    );
  }
  for (const property of ['temperature', 'moisture'] as const) {
    const options = climateContrast(nodes, land, property);
    if (options.length > 0)
      candidates.push(
        wholeSentence(
          `landscape:${biome}:${property}`,
          'climate',
          'distinctive',
          options,
          land.filter((node) => node.biomeId === biome).map((node) => `map-node:${node.id}`),
        ),
      );
  }
  const peers = land.filter((node) => !ids.has(node.id) && node.biomeId === biome);
  const altitude = classifyAltitude(median(nodes, 'elevation'));
  if (peers.length > 0 && classifyAltitude(median(peers, 'elevation')) !== altitude) {
    const terrain = { low: 'low-lying ground', mid: 'upland country', high: 'high country' }[
      altitude
    ];
    candidates.push(
      wholeSentence(
        `landscape:terrain:${terrain}`,
        'terrain',
        'distinctive',
        [
          `The landscape lies across ${terrain}.`,
          `This is a landscape of ${terrain}.`,
          `The area forms a stretch of ${terrain}.`,
        ],
        sourceIds,
      ),
    );
  }
  return { id, kind: 'landscape', candidates };
}

export function settlementRoleNarrative(
  role: SettlementRoleFact,
  options: string[],
  context: NarrativeContext,
  rng: RNG,
): NarrativeResult {
  const subject: NarrativeSubject = {
    id: role.id,
    kind: 'settlement-role',
    candidates: [
      wholeSentence(`settlement-role:${role.reason!.ruleId}`, 'role', 'defining', options, [
        role.id,
      ]),
    ],
  };
  return composeNarrative(
    subject,
    { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 8 },
    context,
    rng,
  );
}

/** The region's overall terrain supplies compatible relief and altitude phrases. */
export function regionalLandNarrative(
  relief: ReliefClass,
  altitude: AltitudeBand,
  rng: RNG,
): string {
  const reliefOptions = {
    flat: ['flat', 'level'],
    hilly: ['hilly', 'rolling'],
    mountainous: ['mountainous', 'rugged with mountains'],
  }[relief];
  const altitudeOptions = {
    low: ['low-lying ground', 'low country'],
    mid: ['upland country', 'uplands'],
    high: ['high country', 'high-lying ground'],
  }[altitude];
  const subject: NarrativeSubject = {
    id: 'area:land',
    kind: 'regional-land',
    candidates: [
      {
        id: 'regional-land:terrain',
        topic: 'terrain',
        importance: 'defining',
        sourceIds: ['area:land'],
        templates: [
          {
            id: 'regional-land:terrain:parts',
            parts: [
              { id: 'opening', options: ['The region is ', 'Across this region, the terrain is '] },
              { id: 'relief', options: reliefOptions },
              { id: 'transition', options: [', with ', ', taking in '] },
              { id: 'altitude', options: altitudeOptions },
              {
                id: 'ending',
                options: [' stretching across the landscape.', ' extending through the country.'],
              },
            ],
          },
        ],
      },
    ],
  };
  return composeNarrative(
    subject,
    { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 0 },
    { recentSelections: [] },
    rng,
  ).text;
}
