import type { NarrativeCandidate } from '$lib/narrative';
import type Region from './region';
import type {
  FactBase,
  FactSource,
  HabitatFact,
  RouteFact,
  SettlementRoleFact,
} from './region_fact_types';
import { biomePhrase } from './region_narrative';

/** Use whole-sentence alternatives for one meaning, keeping all of its supporting facts. */
export function geographyCandidate(
  id: string,
  topic: string,
  options: string[],
  facts: FactBase[],
): NarrativeCandidate {
  return {
    id: `overview:${id}`,
    topic,
    importance: 'defining',
    sourceIds: facts.map((fact) => fact.id),
    templates: [{ id: `overview:${topic}`, parts: [{ id: 'sentence', options }] }],
  };
}

/** Reject absent, wet, or conflicting footprints rather than placing biomes by name alone. */
function habitatNodes(region: Region, habitat: HabitatFact) {
  if (!habitat.name.trim()) return [];
  const ids = habitat.anchor?.nodeIds ?? [];
  const nodes = ids.map((id) => region.map.nodes.find((node) => node.id === id));
  if (!ids.length || new Set(ids).size !== ids.length) return [];
  if (nodes.some((node) => !node || node.isOcean || node.isWater || node.biomeId !== habitat.name))
    return [];
  return nodes.flatMap((node) => (node ? [node] : []));
}

export function overviewLandscape(region: Region, usable: (fact: FactBase) => boolean) {
  const habitats = (region.facts?.habitats ?? [])
    .filter(usable)
    .map((fact) => ({ fact, nodes: habitatNodes(region, fact) }))
    .filter((entry) => entry.nodes.length)
    .sort(
      (a, b) =>
        b.nodes.length - a.nodes.length ||
        (a.fact.id < b.fact.id ? -1 : a.fact.id > b.fact.id ? 1 : 0),
    );
  const first = habitats[0];
  if (!first) return undefined;
  const second = habitats.find((entry) => entry.fact.name !== first.fact.name);
  const phrase = (name: string) =>
    biomePhrase(name)
      .replace('woodland that sheds its leaves with the seasons', 'seasonal woodland')
      .replace('rain-soaked woodland in a mild climate', 'rain-soaked woodland')
      .replace('open grassland in a seasonal climate', 'open grassland');
  const firstPhrase = phrase(first.fact.name);
  const firstCapital = firstPhrase.charAt(0).toUpperCase() + firstPhrase.slice(1);
  const sources: FactSource[] = [];
  const observedNodes = [...first.nodes, ...(second?.nodes ?? [])];
  sources.push(
    ...observedNodes.flatMap((node) =>
      (['biomeId', 'isWater', 'isOcean'] as const).map(
        (property): FactSource => ({
          kind: 'map-node',
          nodeId: node.id,
          property,
          observedValue: String(node[property]),
        }),
      ),
    ),
  );
  const firstIds = new Set(first.nodes.map((node) => node.id));
  const secondIds = new Set(second?.nodes.map((node) => node.id) ?? []);
  const rivers = [...region.map.edges]
    .filter(
      (edge) =>
        edge.river > 0 &&
        region.map.nodes.some((node) => node.id === edge.d0 && !node.isWater && !node.isOcean) &&
        (edge.d1 === undefined ||
          region.map.nodes.some((node) => node.id === edge.d1 && !node.isWater && !node.isOcean)),
    )
    .sort((a, b) => a.id - b.id);
  const dividing = second
    ? rivers.find(
        (edge) =>
          edge.d1 !== undefined &&
          ((firstIds.has(edge.d0) && secondIds.has(edge.d1)) ||
            (secondIds.has(edge.d0) && firstIds.has(edge.d1))),
      )
    : undefined;
  const within = rivers.find(
    (edge) => edge.d1 !== undefined && firstIds.has(edge.d0) && firstIds.has(edge.d1),
  );
  const border = rivers.find(
    (edge) => firstIds.has(edge.d0) || (edge.d1 !== undefined && firstIds.has(edge.d1)),
  );
  const river = dividing ?? within ?? border;
  const water = dividing
    ? ', with a river running between stretches of the two'
    : within
      ? `, with a river running between stretches of ${firstPhrase}`
      : border
        ? `, with a river bordering part of the ${firstPhrase}`
        : '';
  if (river)
    sources.push({
      kind: 'map-edge',
      edgeId: river.id,
      property: 'river',
      observedValue: String(river.river),
    });
  const facts = [first.fact];
  let options = [
    `${firstCapital} spreads across parts of this country${water}.`,
    `Here the country opens into stretches of ${firstPhrase}${water}.`,
  ];
  if (second) {
    facts.push(second.fact);
    const secondPhrase = phrase(second.fact.name);
    options = [
      `${firstCapital} and ${secondPhrase} cover parts of this country${water}.`,
      `The landscape includes both ${firstPhrase} and ${secondPhrase}${water}.`,
    ];
    if (dividing)
      options = [
        `${firstCapital} and ${secondPhrase} meet along a river.`,
        `A river runs between patches of ${firstPhrase} and ${secondPhrase}.`,
      ];
  }
  return { candidate: geographyCandidate('landscape', 'landscape', options, facts), sources };
}

/** Resolve a supported site without guessing a location for missing or contradictory anchors. */
export function overviewSettlement(region: Region, role: SettlementRoleFact) {
  if (role.settlement.kind !== 'embedded') return undefined;
  const index = region.settlementIds?.indexOf(role.settlement.settlementId) ?? -1;
  const settlement = region.settlements[index];
  const node = region.map.nodes.find((entry) => entry.id === settlement?.mapNodeId);
  if (
    !settlement?.name.trim() ||
    !node ||
    node.isWater ||
    node.isOcean ||
    !role.anchor.nodeIds.includes(node.id)
  )
    return undefined;
  const edges = region.map.edges.filter(
    (edge) => role.anchor.edgeIds.includes(edge.id) && (edge.d0 === node.id || edge.d1 === node.id),
  );
  const rule = role.reason?.ruleId;
  if (rule === 'fantasy:region:river-settlement:v1' && !edges.some((edge) => edge.river > 0))
    return undefined;
  if (
    rule === 'fantasy:region:river-crossing:v1' &&
    !edges.some(
      (edge) =>
        edge.river > 0 &&
        (edge.road ?? 0) > 0 &&
        [edge.d0, edge.d1].every((id) =>
          region.map.nodes.some((other) => other.id === id && !other.isOcean && !other.isWater),
        ),
    )
  )
    return undefined;
  if (
    rule === 'fantasy:region:forest-settlement:v1' &&
    !/forest|woodland/i.test(node.biomeId ?? '')
  )
    return undefined;
  if (
    rule === 'fantasy:region:coastal-port-site:v1' &&
    !(
      node.isCoast &&
      region.map.nodes.some((other) => node.neighbors.includes(other.id) && other.isOcean)
    )
  )
    return undefined;
  if (
    rule === 'fantasy:region:agricultural-site:v1' &&
    !(
      node.elevation >= 0 &&
      node.elevation <= 0.4 &&
      node.temperature >= 5 &&
      node.temperature <= 30 &&
      node.moisture >= 0.3 &&
      node.moisture <= 0.8 &&
      /grassland|savanna|plains|prairie/i.test(node.biomeId ?? '')
    )
  )
    return undefined;
  return settlement;
}

/** The saved road must actually trace a continuous land path between its named endpoints. */
export function overviewRoad(
  region: Pick<Region, 'map' | 'settlementIds'> & {
    settlements: { name: string; mapNodeId?: number }[];
  },
  route: RouteFact,
) {
  const settlements = route.endpoints.map((endpoint) => {
    if (endpoint.kind !== 'settlement' || endpoint.settlement.kind !== 'embedded') return undefined;
    const index = region.settlementIds?.indexOf(endpoint.settlement.settlementId) ?? -1;
    return region.settlements[index];
  });
  const [start, end] = settlements;
  const nodeIds = route.anchor.nodeIds;
  const edges = route.anchor.edgeIds.map((id) => region.map.edges.find((edge) => edge.id === id));
  if (!start?.name.trim() || !end?.name.trim() || start === end || nodeIds.length < 2)
    return undefined;
  if (start.mapNodeId !== nodeIds[0] || end.mapNodeId !== nodeIds.at(-1)) return undefined;
  if (new Set(nodeIds).size !== nodeIds.length || edges.length !== nodeIds.length - 1)
    return undefined;
  const nodes = nodeIds.map((id) => region.map.nodes.find((node) => node.id === id));
  if (nodes.some((node) => !node || node.isWater || node.isOcean)) return undefined;
  if (
    edges.some(
      (edge, index) =>
        !edge ||
        !((edge.road ?? 0) > 0) ||
        !(
          (edge.d0 === nodeIds[index] && edge.d1 === nodeIds[index + 1]) ||
          (edge.d1 === nodeIds[index] && edge.d0 === nodeIds[index + 1])
        ),
    )
  )
    return undefined;
  const crossing = edges.find((edge) => edge && edge.river > 0);
  const sources: FactSource[] = crossing
    ? [
        {
          kind: 'map-edge',
          edgeId: crossing.id,
          property: 'river',
          observedValue: String(crossing.river),
        },
      ]
    : [];
  sources.push(
    ...edges.flatMap((edge): FactSource[] =>
      edge
        ? [
            {
              kind: 'map-edge',
              edgeId: edge.id,
              property: 'road',
              observedValue: String(edge.road),
            },
          ]
        : [],
    ),
  );
  sources.push(
    ...nodes.flatMap((node) =>
      node
        ? (['isWater', 'isOcean'] as const).map(
            (property): FactSource => ({
              kind: 'map-node',
              nodeId: node.id,
              property,
              observedValue: String(node[property]),
            }),
          )
        : [],
    ),
  );
  const detail = crossing ? ', meeting a river along the way' : '';
  return {
    settlements: [start, end],
    crossing: Boolean(crossing),
    sources,
    options: [
      `A road leads through the surrounding country from ${start.name.trim()} to ${end.name.trim()}${detail}.`,
      `From ${start.name.trim()}, a road runs through the surrounding country to ${end.name.trim()}${detail}.`,
    ],
  };
}
