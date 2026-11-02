import { RNG } from '@ironarachne/rng';
import {
  architectureResourcesFromCatalog,
  type ArchitectureResources,
  type ArchitectureState,
} from '$lib/architecture';
import { getBuildingMaterialResources } from '$lib/resources';
import { generateSettlementArchitecture, type Settlement } from '$lib/settlements';
import type Region from './region';
import type {
  RegionConstructionPlan,
  SettlementConstructionPlan,
} from './region_construction_types';
import { regionArchitectureResources } from './region_architecture_resources';

export function constructionOperationSeed(seed: string, id: string, completed: boolean): string {
  // Preserve the original operation verbatim for already-complete local construction.
  return JSON.stringify(
    completed ? [seed, 'regional-construction', 1, id] : [seed, 'architecture', id],
  );
}

export function hasDrawableResidentialArchitecture(state: ArchitectureState): boolean {
  const style = state.style;
  return (
    style !== null &&
    state.examples.some((example) => {
      const profile = style.profiles.find((p) => p.id === example.profileId);
      return (
        profile?.context.purpose === 'residential' &&
        profile.context.construction === 'built' &&
        profile.context.exposure !== 'buried' &&
        example.storeys !== null &&
        example.storeys > 0 &&
        profile.variants.some((v) => v.id === example.variantId && v.roof !== null)
      );
    })
  );
}

function baselineSupply(
  region: Region,
  resources: ArchitectureResources[],
  rng: RNG,
): ArchitectureResources {
  if (!region.settlements.length) return { knowledge: 'known', entries: [] };
  const local = new Map(resources.flatMap((r) => r.entries.map((e) => [e.id, e] as const)));
  const wood = [...local.values()].filter((e) =>
    ['timber', 'pole', 'board'].includes(e.form),
  ).length;
  const masonry = [...local.values()].filter((e) =>
    ['block', 'brick', 'tile'].includes(e.form),
  ).length;
  const climate = region.environment.climate;
  const tradition = rng.weighted([
    { value: 'timber', commonality: 4 + wood * 2 + (climate.humidity >= 0.6 ? 2 : 0) },
    { value: 'masonry', commonality: 4 + masonry * 2 + (climate.temperature >= 22 ? 2 : 0) },
  ]);
  const catalog = getBuildingMaterialResources();
  const required = (name: string) => {
    const resource = catalog.find((r) => r.name === name);
    if (!resource) throw new Error(`Missing regional construction material: ${name}`);
    return resource;
  };
  const selected =
    tradition === 'timber'
      ? architectureResourcesFromCatalog(
          [
            required('pine timber'),
            { ...required('pine timber'), name: 'pine boards', minor_type: 'board' },
          ],
          {
            'pine boards': { id: 'boards', form: 'board' },
          },
        )
      : architectureResourcesFromCatalog([required('sandstone block'), required('slate tile')]);
  return {
    knowledge: 'known',
    entries: selected.entries.map((e) => ({
      ...e,
      id: `regional-construction:v1:import:${tradition}:${e.form}`,
      origin: 'imported',
      evidenceIds: [],
    })),
  };
}

function completeResources(
  settlement: Settlement,
  local: ArchitectureResources,
  supply: ArchitectureResources,
  seed: string,
): ArchitectureResources {
  // The two-material baseline is a complete system. Try each single supplement first so a
  // compatible local frame, floor or covering is reused instead of importing its replacement.
  const candidates = [...supply.entries.map((e) => [e]), supply.entries];
  for (const imports of candidates) {
    const resources: ArchitectureResources = {
      knowledge: 'known',
      entries: [...local.entries, ...imports],
    };
    const state = generateSettlementArchitecture(settlement, { seed, resources });
    if (hasDrawableResidentialArchitecture(state)) return resources;
  }
  throw new Error(`Unable to complete regional construction for ${settlement.name}`);
}

/** Keep an already drawable pre-normalization palette byte-for-byte stable. Newly understood
 * timber is used when completion is needed, without rerolling styles that already worked. */
function preserveCompleteLocalPalette(
  settlement: Settlement,
  resources: ArchitectureResources,
  seed: string,
): ArchitectureResources {
  const newlyTyped = resources.entries.filter(
    (e) =>
      e.form === 'timber' &&
      e.resource.major_type === 'wood' &&
      e.resource.minor_type === 'timber' &&
      architectureResourcesFromCatalog([e.resource]).entries[0].form === 'unknown',
  );
  if (!newlyTyped.length) return resources;
  const prior: ArchitectureResources = {
    knowledge: 'known',
    entries: resources.entries.map((e) => (newlyTyped.includes(e) ? { ...e, form: 'unknown' } : e)),
  };
  return hasDrawableResidentialArchitecture(
    generateSettlementArchitecture(settlement, { seed, resources: prior }),
  )
    ? prior
    : resources;
}

export function planRegionConstruction(region: Region, seed: string): RegionConstructionPlan {
  const locals = region.settlements.map((_, index) =>
    regionArchitectureResources(region, {
      kind: 'embedded',
      settlementId: region.settlementIds?.[index] ?? `settlement:${index + 1}`,
    }),
  );
  // A separate, versioned generation operation: never consume geography/population RNG draws.
  const supply = baselineSupply(
    region,
    locals,
    new RNG(JSON.stringify([seed, 'regional-construction', 1, 'supply'])),
  );
  const settlements: SettlementConstructionPlan[] = region.settlements.map((settlement, index) => {
    const settlementId = region.settlementIds?.[index] ?? `settlement:${index + 1}`;
    const localResources = locals[index];
    const compatibleLocal = preserveCompleteLocalPalette(
      settlement,
      localResources,
      constructionOperationSeed(seed, settlementId, false),
    );
    const localState = generateSettlementArchitecture(settlement, {
      seed: constructionOperationSeed(seed, settlementId, false),
      resources: compatibleLocal,
    });
    const needsCompletion =
      !settlement.environment.biome.isAquatic && !hasDrawableResidentialArchitecture(localState);
    const effectiveResources = needsCompletion
      ? completeResources(
          settlement,
          localResources,
          supply,
          constructionOperationSeed(seed, settlementId, true),
        )
      : compatibleLocal;
    return { settlementId, localResources, effectiveResources, needsCompletion };
  });
  return { policyVersion: 1, seed, baselineSupply: supply, settlements };
}
