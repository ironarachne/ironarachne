import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { migrateRegionSnapshot } from '../src/lib/regions/region_artifact_kind';
import { emptyRegionFacts } from '../src/lib/regions/region_facts';
import { historyObservation } from '../src/lib/regions/region_history_evidence';
import type { RegionSnapshot } from '../src/lib/regions/region_snapshot';
import type {
  HistoryConsequence,
  HistoryEvent,
  HistoryOutcome,
  HistoryReference,
} from '../src/lib/regions/region_history_types';

const migrated = migrateRegionSnapshot(
  JSON.parse(gunzipSync(readFileSync('test_fixtures/region_history_481.json.gz')).toString())[0]
    .snapshot,
  24,
);
if (!migrated.ok) throw new Error(migrated.message);
const base = migrated.value;

/** Six explicit events isolate each supported edit/dependency without random fixture selection. */
export function historyEditingFixture(): RegionSnapshot {
  const snapshot = structuredClone(base);
  snapshot.name = 'History fixture';
  snapshot.facts = emptyRegionFacts('current');
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  snapshot.realmIds = ['realm:local', 'realm:parent'];
  snapshot.realms = snapshot.realmIds.map((id, index) => ({
    ...structuredClone(base.realms[0]),
    name: index === 0 ? 'the Local Realm' : 'the Parent Realm',
    parent: index === 0 ? 1 : -1,
    claims: [],
    tiles: [],
    description: id,
  }));
  snapshot.affiliation = 'affiliated';
  snapshot.mainRealm = 0;
  snapshot.authority = snapshot.realms[0].authority;
  snapshot.organizations = ['organization:a', 'organization:b'].map((id, index) => ({
    ...structuredClone(base.organizations[0]),
    id,
    name: `Order ${index === 0 ? 'A' : 'B'}`,
    relationships: [
      { kind: 'rival', relatedOrganizationId: index === 0 ? 'organization:b' : 'organization:a' },
    ],
  }));
  snapshot.settlements = [{ ...structuredClone(base.settlements[0]), id: 'settlement:site' }];
  delete snapshot.settlements[0].descriptionReason;
  snapshot.settlements[0].snapshot.name = 'Fixture Town';
  const node = snapshot.map.nodes.find(
    (node) => node.id === snapshot.settlements[0].snapshot.mapNodeId,
  )!;
  snapshot.facts.resources = [
    {
      id: 'resource:stone',
      name: 'Known stone',
      description: 'A saved local source',
      origin: 'authored',
      kind: 'stone',
      availability: 'unknown',
      depositIds: [],
      areaIds: [],
      habitatIds: [],
      anchor: { nodeIds: [node.id], edgeIds: [] },
    },
  ];
  snapshot.facts.settlementRoles = [
    {
      id: 'role:site:fixture',
      name: 'Current site',
      description: '',
      origin: 'generated',
      settlement: { kind: 'embedded', settlementId: 'settlement:site' },
      areaIds: [],
      anchor: { nodeIds: [node.id], edgeIds: [] },
      reason: {
        ruleId: 'fixture:site:v1',
        status: 'current',
        sources: [
          { kind: 'fact', factId: 'resource:stone' },
          {
            kind: 'map-node',
            nodeId: node.id,
            property: 'isWater',
            observedValue: String(node.isWater),
          },
        ],
      },
    },
  ];
  snapshot.history = {
    version: 2,
    state: 'generated',
    actors: [{ id: 'actor:old', name: 'the Old Realm', kind: 'realm', origin: 'generated' }],
    events: [],
  };
  const realm: HistoryReference = { kind: 'realm', realmId: 'realm:local' },
    parent: HistoryReference = { kind: 'realm', realmId: 'realm:parent' },
    actor: HistoryReference = { kind: 'historicalActor', actorId: 'actor:old' },
    site: HistoryReference = { kind: 'settlement', settlementId: 'settlement:site' },
    a: HistoryReference = { kind: 'organization', organizationId: 'organization:a' },
    b: HistoryReference = { kind: 'organization', organizationId: 'organization:b' };
  function event(
    id: string,
    order: number,
    outcome: HistoryOutcome,
    participants: HistoryReference[],
    consequences: HistoryConsequence[],
    observed = participants,
  ): HistoryEvent {
    return {
      id,
      name: id,
      description: `Saved words for ${id}.`,
      origin: 'generated',
      time: { order },
      outcome,
      participants,
      consequences,
      causedByEventIds: [],
      evidence: {
        reason: { ruleId: 'fixture:history:v1', status: 'current', sources: [] },
        observations: observed.map((ref) => historyObservation(snapshot, ref)!),
      },
    };
  }
  const prior = event(
    'event:old-founding',
    0,
    { kind: 'founding', founded: actor },
    [actor],
    [{ kind: 'existence', target: realm }],
    [actor, realm],
  );
  const local = event(
    'event:local-founding',
    1,
    { kind: 'founding', founded: realm },
    [realm],
    [{ kind: 'existence', target: realm }],
  );
  const town = event(
    'event:town-founding',
    2,
    { kind: 'founding', founded: site },
    [site],
    [{ kind: 'existence', target: site }],
    [site, { kind: 'fact', factId: 'role:site:fixture' }],
  );
  town.evidence.reason.sources = [{ kind: 'fact', factId: 'role:site:fixture' }];
  const fall = event(
    'event:fall',
    3,
    { kind: 'fall', historicalRealmId: 'actor:old', successorRealmId: 'realm:local' },
    [actor, realm],
    [{ kind: 'claim-continuity', target: realm }],
  );
  fall.causedByEventIds = [prior.id];
  const war = event(
    'event:war',
    4,
    { kind: 'war', sides: [a, b], resolution: 'rivalry-persists' },
    [a, b],
    [
      { kind: 'rivalry', target: a },
      { kind: 'rivalry', target: b },
    ],
  );
  const vassal = event(
    'event:subordination',
    5,
    { kind: 'incorporation', predecessor: realm, successorRealmId: 'realm:parent' },
    [realm, parent],
    [{ kind: 'subordination', target: realm }],
  );
  snapshot.history.events = [prior, local, town, fall, war, vassal];
  return snapshot;
}
