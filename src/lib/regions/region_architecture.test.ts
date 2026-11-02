import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { getBuildingMaterialResources, getProcessingRecipes } from '$lib/resources';
import {
  legacyArchitectureState,
  validateArchitectureState,
  type ArchitectureResources,
} from '$lib/architecture';
import { generateSettlementArchitecture } from '$lib/settlements';
import { buildSettlementPanorama, renderSettlementPanorama } from '$lib/settlement_illustration';
import { planRegionConstruction, hasDrawableResidentialArchitecture } from './region_construction';
import { toRegionSnapshot } from './region_snapshot';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';
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

describe('regional construction coverage', () => {
  it.each([
    ...REGION_SEED_BANK.map(({ seed }) => seed),
    'architecture-materials',
    'construction-site-0',
    'construction-site-1',
  ])(
    'gives every generated land settlement drawable, repeatable saved architecture: %s',
    (seed) => {
      const first = rollRegionSnapshot(seed);
      const second = rollRegionSnapshot(seed);
      const reopened = toRegionSnapshot(regionFromSnapshot(first, new RNG('reopen')));
      expect(first.settlements.length).toBeGreaterThan(0);
      expect(second).toEqual(first);
      expect(validateRegionSnapshot(first).ok).toBe(true);
      for (const [index, entry] of first.settlements.entries()) {
        const s = entry.snapshot;
        const node = first.map.nodes.find((n) => n.id === s.mapNodeId)!;
        expect(node.isWater || node.isOcean || s.environment.biome.isAquatic).toBe(false);
        expect(validateArchitectureState(s.architecture).ok).toBe(true);
        expect(hasDrawableResidentialArchitecture(s.architecture)).toBe(true);
        expect(s.architecture.examples).toHaveLength(12);
        const input = { ...s, biome: s.environment.biome, terrain: s.environment.terrain };
        const scene = buildSettlementPanorama(input);
        expect(scene.buildings.length).toBeGreaterThan(0);
        expect(reopened.settlements[index].snapshot.architecture).toEqual(s.architecture);
        const read = reopened.settlements[index].snapshot;
        expect(
          renderSettlementPanorama(
            buildSettlementPanorama({
              ...read,
              biome: read.environment.biome,
              terrain: read.environment.terrain,
            }),
          ),
        ).toBe(renderSettlementPanorama(scene));
      }
    },
    20_000,
  );

  it('preserves complete local styles and never adds their imported replacements', () => {
    const { snapshot, target } = fixture();
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    const resources = regionArchitectureResources(region, target);
    const expected = generateSettlementArchitecture(region.settlements[0], {
      resources,
      seed: JSON.stringify(['complete', 'architecture', snapshot.settlements[0].id]),
    });
    const before = structuredClone(region.facts);
    const plan = planRegionConstruction(region, 'complete');
    expect(plan.settlements[0].needsCompletion).toBe(false);
    expect(plan.settlements[0].effectiveResources).toEqual(resources);
    generateRegionArchitecture(region, 'complete');
    expect(region.settlements[0].architecture).toEqual(expected);
    expect(
      region.settlements[0].architecture.style!.materials.every((m) => m.origin === 'local'),
    ).toBe(true);
    expect(region.facts).toEqual(before);
  });

  it('recognizes typed generic timber without turning raw stone into manufactured material', () => {
    const { snapshot, target } = fixture();
    const timber = snapshot.facts.resources[0];
    delete timber.catalogSource;
    timber.name = 'An arbitrary prose label';
    const resources = regionArchitectureResources(snapshot, target);
    const normalized = resources.entries.find((e) => e.id === timber.id)!;
    expect(normalized.resource.name).toBe('timber');
    expect(normalized.form).toBe('timber');
    expect(normalized.evidenceIds).toContain(timber.id);
    const source = rollRegionSnapshot('alpha');
    const raw = regionArchitectureResources(source, {
      kind: 'embedded',
      settlementId: source.settlements[0].id,
    });
    expect(
      raw.entries
        .filter((e) => e.resource.major_type === 'stone')
        .every((e) => e.form === 'unknown'),
    ).toBe(true);
  });

  it('does not reroll a complete old palette when additional generic timber becomes understood', () => {
    const { snapshot, target, anchor } = fixture();
    snapshot.facts.resources.push({
      id: 'generic',
      name: 'Generic wood',
      description: '',
      origin: 'authored',
      kind: 'timber',
      availability: 'available',
      depositIds: [],
      areaIds: [],
      habitatIds: [],
      anchor,
    });
    snapshot.facts.dailyLife[0].inputs.push({
      kind: 'resource',
      resourceId: 'generic',
      anchor,
      depositIds: [],
    });
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    const local = regionArchitectureResources(region, target);
    const prior: ArchitectureResources = {
      knowledge: 'known',
      entries: local.entries.map((e) => (e.id === 'generic' ? { ...e, form: 'unknown' } : e)),
    };
    const expected = generateSettlementArchitecture(region.settlements[0], {
      resources: prior,
      seed: JSON.stringify(['preserve', 'architecture', snapshot.settlements[0].id]),
    });
    expect(hasDrawableResidentialArchitecture(expected)).toBe(true);
    generateRegionArchitecture(region, 'preserve');
    expect(region.settlements[0].architecture).toEqual(expected);
  });

  it('completes unknown or stale contexts explicitly without mutating evidence', () => {
    const { snapshot, target } = fixture();
    snapshot.facts.dailyLife[0].reason = { ruleId: 'test', status: 'stale', sources: [] };
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    const facts = structuredClone(region.facts);
    expect(regionArchitectureResources(region, target)).toEqual({
      knowledge: 'unknown',
      entries: [],
    });
    const plan = planRegionConstruction(region, 'imports');
    expect(plan.settlements.every((p) => p.needsCompletion)).toBe(true);
    expect(plan.baselineSupply.entries).toHaveLength(2);
    for (const entry of plan.settlements[0].effectiveResources.entries) {
      expect(entry.origin).toBe('imported');
      expect(entry.evidenceIds).toEqual([]);
    }
    generateRegionArchitecture(region, 'imports');
    expect(region.facts).toEqual(facts);
    expect(regionArchitectureResources(region, target)).toEqual({
      knowledge: 'unknown',
      entries: [],
    });
    expect(
      region.settlements.every((s) => hasDrawableResidentialArchitecture(s.architecture)),
    ).toBe(true);
    expect(planRegionConstruction(region, 'imports')).toEqual(plan);
    const encoded = new Set(
      Array.from({ length: 8 }, (_, i) =>
        JSON.stringify(planRegionConstruction(region, `variation-${i}`).baselineSupply),
      ),
    );
    expect(encoded.size).toBeGreaterThan(1);
  });

  it('uses a single compatible supplement when local construction is missing only roofing', () => {
    const { snapshot } = fixture();
    snapshot.facts.dailyLife[0].inputs = snapshot.facts.dailyLife[0].inputs.filter(
      (i) => i.kind !== 'resource' || i.resourceId !== 'reed thatch',
    );
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    const plan = planRegionConstruction(region, 'roof');
    expect(plan.settlements[0].needsCompletion).toBe(true);
    const imported = plan.settlements[0].effectiveResources.entries.filter(
      (e) => e.origin === 'imported',
    );
    expect(imported).toHaveLength(1);
    expect(['board', 'tile']).toContain(imported[0].form);
    expect(
      plan.settlements[0].effectiveResources.entries.filter((e) => e.origin === 'local'),
    ).toEqual(plan.settlements[0].localResources.entries);
  });

  it('leaves aquatic authored records and empty regions alone, and never repairs a legacy read', () => {
    const { snapshot } = fixture();
    const region = regionFromSnapshot(snapshot, new RNG('read'));
    region.settlements[0].environment.biome.isAquatic = true;
    region.settlements[0].architecture = legacyArchitectureState();
    const aquatic = structuredClone(region.settlements[0].architecture);
    generateRegionArchitecture(region, 'aquatic');
    expect(region.settlements[0].architecture).toEqual(aquatic);
    snapshot.settlements[0].snapshot.architecture = legacyArchitectureState();
    expect(regionFromSnapshot(snapshot, new RNG('read')).settlements[0].architecture).toEqual(
      legacyArchitectureState(),
    );
    region.settlements = [];
    region.settlementIds = [];
    expect(planRegionConstruction(region, 'empty').baselineSupply.entries).toEqual([]);
    generateRegionArchitecture(region, 'empty');
    expect(region.settlements).toEqual([]);
    expect(
      hasDrawableResidentialArchitecture({
        kind: 'partial',
        style: { ...base.settlements[0].snapshot.architecture.style!, profiles: [] },
        examples: [],
        summary: null,
        diagnostics: [],
      }),
    ).toBe(false);
  });
});
