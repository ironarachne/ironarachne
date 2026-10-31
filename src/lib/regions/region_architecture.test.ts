import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getBuildingMaterialResources, getProcessingRecipes } from '$lib/resources';
import { legacyArchitectureState } from '$lib/architecture';
import { regionArchitectureResources, generateRegionArchitecture } from './region_architecture';
import { rollRegionSnapshot } from './region_roll';
import { regionFromSnapshot } from './region_rehydrate';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { emptyRegionFacts } from './region_facts';
const base = rollRegionSnapshot('architecture-materials');
function fixture() {
  const snapshot = structuredClone(base);
  snapshot.facts = emptyRegionFacts('current');
  const target = { kind: 'embedded' as const, settlementId: snapshot.settlements[0].id };
  const node = snapshot.map.nodes.find((n) => !n.isWater && !n.isOcean)!;
  const anchor = { nodeIds: [node.id], edgeIds: [] };
  snapshot.settlements[0].snapshot.mapNodeId = node.id;
  snapshot.facts.settlementRoles.push({
    id: 'role',
    name: 'site',
    description: '',
    origin: 'authored',
    settlement: target,
    areaIds: [],
    anchor,
  });
  const materials = getBuildingMaterialResources().filter((r) =>
    ['oak timber', 'granite ashlar', 'reed thatch'].includes(r.name),
  );
  for (const resource of materials)
    snapshot.facts.resources.push({
      id: resource.name,
      name: resource.name,
      description: '',
      origin: 'authored',
      kind: 'timber',
      availability: 'available',
      depositIds: [],
      areaIds: [],
      habitatIds: [],
      anchor,
      catalogSource: { kind: 'building-material', resourceName: resource.name },
    });
  snapshot.facts.dailyLife.push({
    id: 'materials',
    name: 'Local construction',
    description: 'English prose is not parsed.',
    origin: 'authored',
    category: 'building-material',
    activityKey: 'construction',
    settlement: target,
    siteRoleId: 'role',
    areaIds: [],
    anchor,
    inputs: materials.map((r) => ({
      kind: 'resource',
      resourceId: r.name,
      anchor,
      depositIds: [],
    })),
  });
  return { snapshot, target, anchor };
}
describe('structured regional architecture resources', () => {
  it('uses actual supported resources and generates stable detached architectural facts', () => {
    const { snapshot, target } = fixture();
    const before = JSON.stringify(snapshot);
    const resources = regionArchitectureResources(snapshot, target);
    expect(resources.knowledge).toBe('known');
    expect(resources.entries.map((e) => e.form).sort()).toEqual(['block', 'thatch', 'timber']);
    expect(JSON.stringify(snapshot)).toBe(before);
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    generateRegionArchitecture(region, 'style');
    expect(region.settlements[0].architecture.kind).toBe('generated');
    expect(region.settlements[0].architecture.examples).toHaveLength(12);
    const a = structuredClone(region.settlements[0].architecture);
    generateRegionArchitecture(region, 'style');
    expect(region.settlements[0].architecture).toEqual(a);
    snapshot.facts.resources[0].availability = 'limited';
    expect(
      regionArchitectureResources(snapshot, target).entries.some(
        (e) => e.availability === 'limited',
      ),
    ).toBe(true);
  });
  it('reports stale, missing, and unknown contexts without inventing a palette', () => {
    const { snapshot, target } = fixture();
    snapshot.facts.dailyLife[0].reason = { ruleId: 'test', status: 'stale', sources: [] };
    expect(regionArchitectureResources(snapshot, target).knowledge).toBe('unknown');
    snapshot.facts.dailyLife = [];
    expect(regionArchitectureResources(snapshot, target).knowledge).toBe('unknown');
    expect(regionArchitectureResources({ ...snapshot, facts: undefined }, target).knowledge).toBe(
      'unknown',
    );
  });
  it('accepts evidenced finished products but does not turn raw rock or ore into finished materials', () => {
    const { snapshot, target, anchor } = fixture();
    const recipe = getProcessingRecipes().find((r) => r.outputKey === 'sawn-timber')!;
    snapshot.facts.products.push({
      id: 'sawn',
      name: recipe.outputName,
      description: '',
      origin: 'authored',
      productKey: recipe.outputKey,
      recipeId: recipe.id,
      technique: recipe.technique,
      requirements: recipe.requirements,
      settlement: target,
      areaIds: [],
      anchor,
      inputs: [
        { kind: 'resource', role: 'material', resourceId: 'oak timber', anchor, depositIds: [] },
      ],
    });
    snapshot.facts.dailyLife[0].inputs = [{ kind: 'product', productId: 'sawn' }];
    expect(
      regionArchitectureResources(snapshot, target)
        .entries.map((e) => e.form)
        .sort(),
    ).toEqual(['board', 'timber']);
    snapshot.facts.products[0].inputs.push({
      kind: 'import',
      role: 'material',
      resourceName: 'Imported iron',
      explanation: 'Explicit import',
    });
    expect(regionArchitectureResources(snapshot, target).knowledge).toBe('unknown');
  });
  it('migrates embedded v20 settlements without touching prose, facts, or maps', () => {
    const snapshot = structuredClone(base);
    const old = {
      ...snapshot,
      settlements: snapshot.settlements.map((entry) => {
        const { architecture: _architecture, ...stored } = entry.snapshot;
        return { ...entry, snapshot: stored };
      }),
    };
    const result = migrateRegionSnapshot(old, 20);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.settlements.every((e) => e.snapshot.architecture.kind === 'legacy')).toBe(
      true,
    );
    expect(result.value.settlements[0].snapshot.architecture).toEqual(legacyArchitectureState());
    expect(result.value.facts).toEqual(snapshot.facts);
    expect(result.value.map).toEqual(snapshot.map);
    expect(result.value.settlements[0].snapshot.description).toBe(
      snapshot.settlements[0].snapshot.description,
    );
    expect(
      validateRegionSnapshot({
        ...snapshot,
        settlements: [
          {
            ...snapshot.settlements[0],
            snapshot: { ...snapshot.settlements[0].snapshot, architecture: null },
          },
        ],
      }).ok,
    ).toBe(false);
  });
});
