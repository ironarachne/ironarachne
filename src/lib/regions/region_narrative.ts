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

/** Interpret category names without adding species, land use, or precise climate claims. */
export function biomePhrase(biome: string): string {
  const phrases: Record<string, string> = {
    'tropical rainforest': 'rain-soaked tropical forest',
    'tropical seasonal forest': 'tropical woodland with wet and dry seasons',
    'tropical savanna': 'warm grassland with scattered trees',
    'subtropical desert': 'hot desert country',
    'temperate rainforest': 'rain-soaked woodland in a mild climate',
    'temperate deciduous forest': 'woodland that sheds its leaves with the seasons',
    'mediterranean woodland': 'woodland adapted to dry summers',
    'temperate grassland': 'open grassland in a seasonal climate',
    'cold desert': 'cold desert country',
    'boreal forest': 'conifer woodland in a cold climate',
    tundra: 'cold, treeless country',
    'ice cap': 'ice-covered country',
    'alpine tundra': 'treeless alpine country',
    'montane forest': 'mountain woodland',
    'montane grassland': 'mountain grassland',
    'flooded grassland': 'waterlogged grassland',
    'mangrove forest': 'mangrove woodland',
    'freshwater lake': 'freshwater lake country',
    'freshwater river': 'freshwater river country',
    'freshwater wetland': 'freshwater wetland',
    'intertidal zone': 'shore exposed between the tides',
    'kelp forest': 'underwater kelp forest',
    'coral reef': 'coral reef',
    estuary: 'water where river and sea meet',
    'pelagic ocean': 'open ocean',
    'abyssal ocean': 'deep ocean',
  };
  return Object.hasOwn(phrases, biome) ? phrases[biome] : biome;
}

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
    `This country is noticeably ${contrast} than other stretches of ${biomePhrase(nodes[0].biomeId!)} in the region.`,
    `Within the region’s ${biomePhrase(nodes[0].biomeId!)}, this stretch stands out as distinctly ${contrast}.`,
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
  const landscape = biomePhrase(biome);
  const capitalized = landscape.charAt(0).toUpperCase() + landscape.slice(1);
  const identity =
    dominant === undefined
      ? [
          `This stretch of ${landscape} reaches across the ${position} part of the region.`,
          `A stretch of ${landscape} occupies the region’s ${position} country.`,
          `In the ${position} part of the region, ${landscape} shapes the landscape.`,
        ]
      : dominant
        ? [
            `The prevailing landscape here is ${landscape}.`,
            `${capitalized} gives much of the region its character.`,
            `Across the region, ${landscape} is the most widespread landscape.`,
          ]
        : [
            `Stretches of ${landscape} lie within the wider landscape.`,
            `${capitalized} brings a different character to parts of the region.`,
            `The wider landscape is broken by stretches of ${landscape}.`,
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
  const rivers = map.edges.filter(
    (edge) => edge.river > 0 && (ids.has(edge.d0) || (edge.d1 !== undefined && ids.has(edge.d1))),
  );
  if (coast || rivers.length) {
    const riverInside = rivers.some(
      (edge) => ids.has(edge.d0) && edge.d1 !== undefined && ids.has(edge.d1),
    );
    const water = riverInside
      ? 'a river runs between stretches of this country'
      : 'a river borders part of this country';
    const options = rivers.length
      ? coast
        ? [`The landscape meets the sea, while ${water}.`, `Along this coastal country, ${water}.`]
        : [`Here, ${water}.`, `Within the wider landscape, ${water}.`]
      : [
          'It reaches the coast.',
          'The landscape meets the sea.',
          'The coast forms an edge to this country.',
        ];
    candidates.push(
      wholeSentence(
        `landscape:water:${coast}:${rivers.length > 0}`,
        'water',
        'distinctive',
        options,
        [...sourceIds, ...rivers.map((edge) => `map-edge:${edge.id}`)],
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
    mountainous: ['mountainous', 'rugged and mountainous'],
  }[relief];
  const altitudeOptions = {
    low: ['low-lying country', 'low country'],
    mid: ['upland country', 'upland terrain'],
    high: ['high country', 'high-lying ground'],
  }[altitude];
  const options = reliefOptions.flatMap((terrain) =>
    altitudeOptions.flatMap((ground) => [
      `${terrain.charAt(0).toUpperCase() + terrain.slice(1)} ${ground} extends across the region.`,
      `The region takes in ${terrain} ${ground}.`,
    ]),
  );
  const subject: NarrativeSubject = {
    id: 'area:land',
    kind: 'regional-land',
    candidates: [
      wholeSentence('regional-land:terrain', 'terrain', 'defining', options, ['area:land']),
    ],
  };
  return composeNarrative(
    subject,
    { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 0 },
    { recentSelections: [] },
    rng,
  ).text;
}
