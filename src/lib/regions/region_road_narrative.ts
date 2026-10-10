import { composeNarrative, type NarrativeContext } from '$lib/narrative';
import type { MapNode, MapEdge } from '$lib/map';
import type { RNG } from '@ironarachne/rng';
import type { FactSource, MapNodeFactProperty } from './region_fact_types';

const wording = {
  river: {
    detail: [
      'The road meets a river along the journey.',
      'A river crossing breaks the overland journey.',
    ],
    hook: [
      'Hook: Scout the crossing before escorting a caravan through.',
      'Hook: Lead a supply party to the river and assess a safe passage.',
    ],
  },
  coast: {
    detail: [
      'Part of the road reaches coastal country, bringing the sea into the journey.',
      'The journey takes in coastal land where the region meets the sea.',
    ],
    hook: [
      'Hook: Survey the coastal stretch as an approach for an expedition.',
      'Hook: Escort a surveying party to explore the coast along this route.',
    ],
  },
  forest: {
    detail: [
      'Woodland surrounds part of the route, drawing the journey into forest country.',
      'The road passes through forest country on its way between settlements.',
    ],
    hook: [
      'Hook: Guide a party into the woodland to survey the approaches to the road.',
      'Hook: Escort explorers along the road while they investigate the surrounding forest.',
    ],
  },
  grassland: {
    detail: [
      'Grassland opens around part of the road, giving the journey a stretch of open country.',
      'Part of the journey crosses grassland between the settlements.',
    ],
    hook: [
      'Hook: Survey the grassland beside the road for an expedition’s stopping places.',
      'Hook: Guide a scouting party across the open country along this route.',
    ],
  },
  cold: {
    detail: [
      'Freezing country lies along the road, making exposure a concern for travelers.',
      'Part of the route crosses cold country where shelter matters on the journey.',
    ],
    hook: [
      'Hook: Escort a supply party through the cold stretch and plan shelter along the way.',
      'Hook: Scout places to shelter before leading travelers through the freezing country.',
    ],
  },
  dry: {
    detail: [
      'Hot, dry country lies along the road, making water planning part of the journey.',
      'The road crosses a stretch of hot, dry land where travelers must consider their water supplies.',
    ],
    hook: [
      'Hook: Survey water access before bringing a caravan through the dry stretch.',
      'Hook: Guide a supply party along the road with enough water for the hot country.',
    ],
  },
  journey: {
    detail: [
      'The journey offers a way to explore the country between two inhabited places.',
      'Following the road takes travelers beyond either settlement into the intervening country.',
    ],
    hook: [
      'Hook: Escort a messenger between the settlements and survey the route for a later expedition.',
      'Hook: Guide a supply caravan along the road and scout stopping places for future journeys.',
    ],
  },
};

/** Describe only the traced road, retaining evidence for the selected narrative meaning. */
export function roadNarrative(
  id: string,
  nodes: MapNode[],
  edges: MapEdge[],
  context: NarrativeContext,
  rng: RNG,
) {
  const meanings: { key: keyof typeof wording; sources: FactSource[] }[] = [];
  const addNodes = (
    key: keyof typeof wording,
    matches: MapNode[],
    properties: MapNodeFactProperty[],
  ) => {
    if (matches.length === 0) return;
    meanings.push({
      key,
      sources: matches.flatMap((node) =>
        properties.map(
          (property): FactSource => ({
            kind: 'map-node',
            nodeId: node.id,
            property,
            observedValue: String(node[property]),
          }),
        ),
      ),
    });
  };
  const crossings = edges.filter((edge) => edge.river > 0);
  if (crossings.length > 0)
    meanings.push({
      key: 'river',
      sources: crossings.map((edge) => ({
        kind: 'map-edge',
        edgeId: edge.id,
        property: 'river',
        observedValue: String(edge.river),
      })),
    });
  addNodes(
    'coast',
    nodes.filter((node) => node.isCoast),
    ['isCoast'],
  );
  addNodes(
    'forest',
    nodes.filter((node) => /forest|woodland/i.test(node.biomeId ?? '')),
    ['biomeId'],
  );
  addNodes(
    'grassland',
    nodes.filter((node) => /grassland|savanna|plains|prairie/i.test(node.biomeId ?? '')),
    ['biomeId'],
  );
  addNodes(
    'cold',
    nodes.filter((node) => node.temperature <= 0),
    ['temperature'],
  );
  addNodes(
    'dry',
    nodes.filter((node) => node.temperature >= 30 && node.moisture <= 0.2),
    ['temperature', 'moisture'],
  );
  if (meanings.length === 0) meanings.push({ key: 'journey', sources: [] });

  const compose = (pool: { key: string; options: string[] }[], history: NarrativeContext) =>
    composeNarrative(
      {
        id,
        kind: 'region-road',
        candidates: pool.map(({ key, options }) => ({
          id: `road:${key}`,
          topic: 'travel',
          importance: 'defining',
          sourceIds: [id],
          templates: [{ id: `road:${key}:sentence`, parts: [{ id: 'sentence', options }] }],
        })),
      },
      { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 18 },
      history,
      rng,
    );
  const identity = compose(
    [
      {
        key: 'connection',
        options: [
          'This road links the two settlements across the surrounding country.',
          'Travelers can follow this road from one settlement to the other.',
        ],
      },
    ],
    context,
  );
  const detail = compose(
    meanings.map(({ key }) => ({ key, options: wording[key].detail })),
    identity.nextContext,
  );
  const selected = meanings.find(({ key }) => `road:${key}` === detail.selections[0].candidateId)!;
  const hook = compose(
    [{ key: `${selected.key}:hook`, options: wording[selected.key].hook }],
    detail.nextContext,
  );
  return {
    text: `${identity.text} ${detail.text} ${hook.text}`,
    sources: selected.sources,
    nextContext: hook.nextContext,
  };
}
