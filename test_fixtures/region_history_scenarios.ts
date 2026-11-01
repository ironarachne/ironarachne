import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { migrateRegionSnapshot } from '../src/lib/regions/region_artifact_kind';
import { emptyRegionFacts } from '../src/lib/regions/region_facts';
import { emptyRegionHistory } from '../src/lib/regions/region_realm_identity';
import type { RegionSnapshot } from '../src/lib/regions/region_snapshot';

const captured = JSON.parse(
  gunzipSync(readFileSync('test_fixtures/region_history_481.json.gz')).toString(),
)[0].snapshot;
const migrated = migrateRegionSnapshot(captured, 24);
if (!migrated.ok) throw new Error(migrated.message);
export const historyPresentBase = migrated.value;
const base = historyPresentBase;
export function context(): RegionSnapshot {
  const snapshot = structuredClone(base);
  snapshot.affiliation = 'unaffiliated';
  snapshot.mainRealm = null;
  snapshot.authority = null;
  snapshot.realmIds = [];
  snapshot.realms = [];
  snapshot.organizations = [];
  snapshot.settlements = [];
  snapshot.facts = emptyRegionFacts('current');
  snapshot.history = emptyRegionHistory();
  delete snapshot.gazetteer;
  delete snapshot.overviewReason;
  return snapshot;
}
export function realms(snapshot: RegionSnapshot, count: number) {
  snapshot.realmIds = Array.from({ length: count }, (_, i) => `realm:${i}`);
  snapshot.realms = snapshot.realmIds.map((id, i) => ({
    ...structuredClone(base.realms[0]),
    name: `the Realm of ${String.fromCharCode(65 + i)}`,
    parent: -1,
    claims: [],
    tiles: [],
    description: id,
  }));
}
export function organizations(snapshot: RegionSnapshot, count: number) {
  snapshot.organizations = Array.from({ length: count }, (_, i) => ({
    ...structuredClone(base.organizations[0]),
    id: `organization:${i}`,
    name: `Order ${String.fromCharCode(65 + i)}`,
    relationships: [],
  }));
}
export function settlement(snapshot: RegionSnapshot, id = 'settlement:one') {
  const entry = structuredClone(base.settlements[0]);
  entry.id = id;
  entry.snapshot.name = `Town ${id}`;
  delete entry.descriptionReason;
  snapshot.settlements.push(entry);
  const node = snapshot.map.nodes.find((node) => node.id === entry.snapshot.mapNodeId)!;
  snapshot.facts.settlementRoles.push({
    id: `role:site:${id}`,
    name: 'Present site',
    description: '',
    origin: 'generated',
    settlement: { kind: 'embedded', settlementId: id },
    areaIds: [],
    anchor: { nodeIds: [node.id], edgeIds: [] },
    reason: {
      ruleId: 'fantasy:region:land-placement:v1',
      status: 'current',
      sources: [
        {
          kind: 'map-node',
          nodeId: node.id,
          property: 'isWater',
          observedValue: String(node.isWater),
        },
      ],
    },
  });
}

/** Approved-design scenarios: alter only explicit saved present support, never infer it from names. */
export const HISTORY_ACCEPTANCE_SCENARIOS = [
  {
    key: 'sparse',
    seed: 'history-test',
    build() {
      const snapshot = context();
      settlement(snapshot);
      snapshot.settlements[0].snapshot.name = 'Reedford';
      return snapshot;
    },
  },
  {
    key: 'crowded',
    seed: 'history-test',
    build() {
      const snapshot = context();
      realms(snapshot, 8);
      organizations(snapshot, 10);
      for (let i = 0; i < 8; i++) settlement(snapshot, `settlement:${i}`);
      for (let i = 0; i < 6; i++) snapshot.realms[i].parent = 7;
      snapshot.organizations.forEach((org, i) => {
        if (i % 2 === 0)
          org.relationships = [
            { kind: 'rival', relatedOrganizationId: snapshot.organizations[i + 1].id },
          ];
      });
      return snapshot;
    },
  },
  {
    key: 'unaffiliated',
    seed: 'unaffiliated:485',
    build() {
      const snapshot = context();
      settlement(snapshot);
      snapshot.settlements[0].snapshot.name = 'Reedford';
      organizations(snapshot, 2);
      snapshot.organizations[0].relationships = [
        { kind: 'rival', relatedOrganizationId: 'organization:1' },
      ];
      return snapshot;
    },
  },
  {
    key: 'conflicting-claims',
    seed: 'conflicting-claims:482',
    build() {
      const snapshot = context();
      realms(snapshot, 2);
      snapshot.realms.forEach((realm, index) => {
        realm.claims = [
          {
            claimantId: 1 - index,
            claimantName: snapshot.realms[1 - index].name,
            status: 'unpressed',
          },
        ];
      });
      return snapshot;
    },
  },
] as const;
