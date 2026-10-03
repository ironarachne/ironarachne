import { describe, expect, it } from 'vitest';
import {
  settlementToMarkdown,
  settlementToPlainText,
  settlementFromSnapshot,
} from '$lib/settlements';
import { describeRegionMaterials, regionMaterialSources } from './region_material_context';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';

const base = rollRegionSnapshot('material-context');
const target = { kind: 'embedded' as const, settlementId: base.settlements[0].id };
function fixture(name = 'Timber village', material = 'oak timber') {
  const snapshot = structuredClone(base);
  const site = snapshot.map.nodes.find((node) => !node.isWater && !node.isOcean)!;
  snapshot.settlements[0].snapshot.name = name;
  snapshot.settlements[0].snapshot.mapNodeId = site.id;
  snapshot.facts = emptyRegionFacts('current');
  snapshot.facts.settlementRoles.push({
    id: 'role:site',
    name: 'Forest site',
    description: '',
    origin: 'generated',
    settlement: target,
    areaIds: [],
    anchor: { nodeIds: [site.id], edgeIds: [] },
    reason: {
      ruleId: 'test:site',
      status: 'current',
      sources: [{ kind: 'map-node', nodeId: site.id, property: 'isWater', observedValue: 'false' }],
    },
  });
  snapshot.facts.resources.push({
    id: 'resource:wood',
    name: material,
    description: 'Limited household supply',
    origin: 'authored',
    kind: 'timber',
    availability: 'limited',
    depositIds: [],
    areaIds: [],
    habitatIds: [],
    anchor: { nodeIds: [site.id], edgeIds: [] },
  });
  snapshot.facts.dailyLife.push({
    id: 'daily-life:material',
    name: material,
    description: 'Limited gathered material; no commercial scale is implied.',
    origin: 'generated',
    category: 'building-material',
    activityKey: 'test:building',
    settlement: target,
    siteRoleId: 'role:site',
    areaIds: [],
    anchor: { nodeIds: [site.id], edgeIds: [] },
    inputs: [
      {
        kind: 'resource',
        resourceId: 'resource:wood',
        depositIds: [],
        anchor: { nodeIds: [site.id], edgeIds: [] },
      },
    ],
    reason: {
      ruleId: 'test:building',
      status: 'current',
      sources: [
        { kind: 'fact', factId: 'resource:wood' },
        { kind: 'fact', factId: 'role:site' },
      ],
    },
  });
  return snapshot;
}

describe('live regional material presentation', () => {
  it('recognizes current saved environmental observations from real generation', () => {
    const generated = rollRegionSnapshot('alpha');
    for (const entry of generated.settlements) {
      const projection = describeRegionMaterials(generated, {
        kind: 'embedded',
        settlementId: entry.id,
      });
      expect(projection.status).toBe('current');
    }
  });
  it.each([
    ['Timber village', 'oak timber'],
    ['Wetland village', 'reed thatch'],
    ['Quarry village', 'granite'],
  ])('attributes %s materials and preserves supply qualifications', (name, material) => {
    const snapshot = fixture(name, material);
    const before = JSON.stringify(snapshot);
    const result = describeRegionMaterials(snapshot, target);
    expect(result.status).toBe('current');
    expect(result.sourceName).toBe(name);
    expect(result.buildingMaterials[0]).toContain(material);
    expect(result.buildingMaterials[0]).toContain('Limited');
    expect(JSON.stringify(snapshot)).toBe(before);
    const consumer = {
      ...settlementFromSnapshot(snapshot.settlements[0].snapshot),
      name: 'New settlement',
      regionalMaterialContext: { regionTargetId: 'region-one', sourceSettlement: target },
    };
    for (const text of [
      settlementToMarkdown(consumer, { regionalMaterials: result }),
      settlementToPlainText(consumer, { regionalMaterials: result }),
    ]) {
      expect(text.toLowerCase()).toContain(name.toLowerCase());
      expect(text).toContain(material);
      expect(text).toContain('do not establish supply at this settlement');
    }
  });
  it('preserves selection identity through source rename and reorder', () => {
    const snapshot = fixture();
    snapshot.settlements.reverse();
    snapshot.settlements.find((entry) => entry.id === target.settlementId)!.snapshot.name =
      'Renamed source';
    expect(describeRegionMaterials(snapshot, target).sourceName).toBe('Renamed source');
    expect(
      regionMaterialSources(snapshot).some(
        (entry) => JSON.stringify(entry.target) === JSON.stringify(target),
      ),
    ).toBe(true);
  });
  it('omits stale/unavailable support instead of repeating material recommendations', () => {
    for (const change of ['stale', 'unavailable', 'missing', 'changed-map'] as const) {
      const snapshot = fixture();
      if (change === 'stale') snapshot.facts.dailyLife[0].reason!.status = 'stale';
      if (change === 'unavailable') snapshot.facts.resources[0].availability = 'unknown';
      if (change === 'missing') snapshot.facts.resources = [];
      if (change === 'changed-map')
        snapshot.map.nodes.find(
          (node) => node.id === snapshot.facts.settlementRoles[0].anchor.nodeIds[0],
        )!.isWater = true;
      const result = describeRegionMaterials(snapshot, target);
      expect(result.status).toBe('needs-review');
      expect(result.buildingMaterials).toEqual([]);
      expect(result.notices[0]).toContain('needs review');
    }
  });
  it('leaves old/empty sources usable and deleted sources unresolved', () => {
    const snapshot = fixture();
    snapshot.facts.dailyLife = [];
    expect(describeRegionMaterials(snapshot, target).status).toBe('empty');
    snapshot.settlements = snapshot.settlements.filter((entry) => entry.id !== target.settlementId);
    expect(describeRegionMaterials(snapshot, target).status).toBe('unresolved');
  });
  it('checks complete saved product chains and excludes imports', () => {
    const snapshot = fixture();
    const fact = snapshot.facts.dailyLife[0];
    fact.category = 'craft';
    fact.inputs = [{ kind: 'product', productId: 'product:wood' }];
    snapshot.facts.products.push({
      id: 'product:wood',
      name: 'Local joinery',
      description: '',
      origin: 'authored',
      productKey: 'future:wood',
      recipeId: 'future:joinery',
      technique: 'woodworking',
      requirements: ['joinery tools'],
      inputs: [
        {
          kind: 'resource',
          role: 'material',
          resourceId: 'resource:wood',
          anchor: fact.anchor,
          depositIds: [],
        },
      ],
      settlement: target,
      areaIds: [],
      anchor: fact.anchor,
    });
    expect(describeRegionMaterials(snapshot, target).crafts).toHaveLength(1);
    snapshot.facts.products[0].inputs = [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'foreign timber',
        explanation: 'An authored import',
      },
    ];
    expect(describeRegionMaterials(snapshot, target).status).toBe('needs-review');
    snapshot.facts.products = [];
    expect(describeRegionMaterials(snapshot, target).crafts).toEqual([]);
  });
});
