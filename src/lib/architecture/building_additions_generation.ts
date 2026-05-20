import { RNG } from '@ironarachne/rng';
import { BUILDING_ADDITION_CATALOG } from './building_additions_data';
import type {
  ArchitecturalSiteContext,
  BuildingAddition,
  BuildingAdditionCatalogEntry,
  BuildingPurpose,
  MassingStyle,
  PopulationDensityBand,
  StructuralSystem,
} from './architectural_style_types';

type Rng = InstanceType<typeof RNG>;

function effectiveWeight(
  entry: BuildingAdditionCatalogEntry,
  config: {
    purposes: BuildingPurpose[];
    populationBand: PopulationDensityBand;
    structuralSystem: StructuralSystem;
    massing: MassingStyle;
    site: ArchitecturalSiteContext;
    hasWood: boolean;
    hasMasonry: boolean;
  },
): number {
  let w = entry.weight;
  if (entry.kind === 'widow_walk' && config.site.coastal) {
    w *= 1.85;
  }
  if (entry.kind === 'arcade' && config.massing === 'courtyard_clusters') {
    w *= 1.25;
  }
  if (entry.kind === 'pergola' && config.massing === 'courtyard_clusters') {
    w *= 1.35;
  }
  if (entry.kind === 'flying_buttress' && config.structuralSystem === 'load_bearing_masonry') {
    w *= 1.4;
  }
  if (entry.kind === 'wall_walk' && config.purposes.includes('defensive')) {
    w *= 1.2;
  }
  if (entry.kind === 'belfry' && config.purposes.includes('religious')) {
    w *= 1.3;
  }
  if (entry.kind === 'drying_gallery' && config.purposes.includes('storage')) {
    w *= 1.25;
  }
  return Math.max(1, Math.round(w));
}

function filterEligible(config: {
  purposes: BuildingPurpose[];
  hasWood: boolean;
  hasMasonry: boolean;
}): BuildingAdditionCatalogEntry[] {
  const purposeSet = new Set(config.purposes);
  return BUILDING_ADDITION_CATALOG.filter((e) => {
    if (!e.eligiblePurposes.some((p) => purposeSet.has(p))) {
      return false;
    }
    if (e.requiresMasonry && !config.hasMasonry) {
      return false;
    }
    if (e.requiresWood && !config.hasWood) {
      return false;
    }
    return true;
  });
}

/**
 * Picks a small set of functional and ornamental building additions suited to the purposes.
 * Use a dedicated RNG, e.g. `new RNG(\`\${seed}:building_additions\`)`.
 */
export function buildBuildingAdditions(
  config: {
    purposes: BuildingPurpose[];
    populationBand: PopulationDensityBand;
    structuralSystem: StructuralSystem;
    massing: MassingStyle;
    site: ArchitecturalSiteContext;
    hasWood: boolean;
    hasMasonry: boolean;
  },
  rng: Rng,
): BuildingAddition[] {
  const eligible = filterEligible(config);
  if (eligible.length === 0) {
    return [];
  }

  const scored = eligible.map((e) => ({
    entry: e,
    w: effectiveWeight(e, config),
  }));

  const baseTarget =
    1 +
    rng.int(0, 2) +
    (config.purposes.length > 1 ? 1 : 0) +
    (config.populationBand === 'high' ? 1 : 0);
  const target = Math.min(scored.length, Math.max(1, baseTarget));

  const out: BuildingAddition[] = [];
  const remaining = [...scored];
  let attempts = 0;
  while (out.length < target && remaining.length > 0 && attempts < 72) {
    attempts++;
    const pick = rng.weighted(remaining.map((r) => ({ value: r, commonality: r.w })));
    out.push({ kind: pick.entry.kind, role: pick.entry.role });
    const idx = remaining.findIndex((x) => x.entry.kind === pick.entry.kind);
    if (idx >= 0) {
      remaining.splice(idx, 1);
    }
  }

  return out;
}
