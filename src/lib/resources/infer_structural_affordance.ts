import type { Resource } from './resource_types';
import type { BuildingMaterialRole, BuildingStructuralAffordance, SpanCategory } from './structural_affordance';

function clamp01(n: number): number {
  if (Number.isNaN(n)) {
    return 0;
  }
  return Math.min(1, Math.max(0, n));
}

function getNumericProperty(resource: Resource, name: string): number | null {
  const p = resource.properties.find((x) => x.name === name);
  if (p == null) {
    return null;
  }
  if (typeof p.value === 'number') {
    return p.value;
  }
  const parsed = Number.parseFloat(String(p.value));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Mohs hardness 1–10 → rough weather resistance 0–1 */
function weatherFromHardness(mohs: number): number {
  return clamp01((mohs - 1) / 9);
}

/** Density kg/m³ rough bands → thermal mass hint */
function thermalMassFromDensity(kgPerM3: number): number {
  if (kgPerM3 < 500) {
    return clamp01(kgPerM3 / 1000);
  }
  if (kgPerM3 < 2000) {
    return clamp01(0.35 + (kgPerM3 - 500) / 4500);
  }
  return clamp01(0.65 + (kgPerM3 - 2000) / 12000);
}

function spanFromFlexuralHint(tensile: number, majorType: string): SpanCategory {
  if (majorType === 'wood' || majorType === 'bamboo') {
    if (tensile >= 0.55) {
      return 'long';
    }
    if (tensile >= 0.35) {
      return 'medium';
    }
    return 'short';
  }
  if (majorType === 'stone' || majorType === 'brick' || majorType === 'ceramic') {
    return 'short';
  }
  if (tensile >= 0.5) {
    return 'medium';
  }
  return 'short';
}

function rolesForMajorMinor(
  major: string,
  minor: string,
  compressive: number,
  tensile: number,
): BuildingMaterialRole[] {
  const roles = new Set<BuildingMaterialRole>();

  const m = major.toLowerCase();
  const n = minor.toLowerCase();

  if (m === 'wood' || m === 'bamboo' || m === 'timber') {
    roles.add('primary_structure');
    roles.add('enclosure');
    roles.add('roofing');
    if (tensile < 0.3) {
      roles.delete('roofing');
    }
  } else if (m === 'stone' || m === 'brick' || m === 'ceramic') {
    roles.add('primary_structure');
    roles.add('enclosure');
    roles.add('foundation');
    if (compressive >= 0.45) {
      roles.add('ornament');
    }
  } else if (m === 'earth' || m === 'clay' || n.includes('adobe') || n.includes('rammed')) {
    roles.add('primary_structure');
    roles.add('enclosure');
    roles.add('foundation');
  } else if (m === 'thatch' || m === 'fibre' || m === 'straw' || n.includes('thatch')) {
    roles.add('roofing');
    roles.add('enclosure');
  } else   if (m === 'metal') {
    roles.add('ornament');
    if (n.includes('ore')) {
      /* Raw ore: decorative / trace use only for vernacular architecture. */
    } else if (tensile >= 0.35 || compressive >= 0.4) {
      roles.add('primary_structure');
      roles.add('enclosure');
      roles.add('roofing');
    }
  } else if (m === 'lime' || m === 'gypsum' || n.includes('plaster')) {
    roles.add('enclosure');
    roles.add('ornament');
  } else {
    roles.add('enclosure');
    if (compressive > 0.35) {
      roles.add('foundation');
    }
  }

  return [...roles];
}

function inferFromMetalOre(resource: Resource): Partial<BuildingStructuralAffordance> {
  const density = getNumericProperty(resource, 'density');
  const hardness = getNumericProperty(resource, 'hardness');
  /** Raw ore is not used as vernacular structural mass; keep scores low for building selection. */
  let compressive = 0.12;
  let tensile = 0.15;
  if (density != null) {
    compressive = clamp01(0.08 + (density - 2000) / 90000);
    tensile = clamp01(0.1 + density / 80000);
  }
  if (hardness != null) {
    compressive = clamp01(compressive + (hardness / 10) * 0.05);
  }
  return {
    compressiveSuitability: compressive,
    tensileSuitability: tensile,
    thermalMass: density != null ? thermalMassFromDensity(density) * 0.6 : 0.25,
    weatherResistance: hardness != null ? weatherFromHardness(hardness) * 0.7 : 0.25,
    earthworkSuitability: 0,
  };
}

function inferFromStone(resource: Resource): Partial<BuildingStructuralAffordance> {
  const density = getNumericProperty(resource, 'density');
  const hardness = getNumericProperty(resource, 'hardness');
  const comp = density != null ? clamp01(0.45 + density / 22000) : 0.65;
  const ten = 0.12;
  const thermal = density != null ? thermalMassFromDensity(density) : 0.7;
  const weather = hardness != null ? weatherFromHardness(hardness) : 0.55;
  return {
    compressiveSuitability: comp,
    tensileSuitability: ten,
    thermalMass: thermal,
    weatherResistance: weather,
    earthworkSuitability: 0.05,
  };
}

function inferFromWood(resource: Resource): Partial<BuildingStructuralAffordance> {
  const density = getNumericProperty(resource, 'density');
  const hardness = getNumericProperty(resource, 'hardness');
  const tensile = density != null ? clamp01(0.35 + (800 - Math.abs(density - 600)) / 2000) : 0.55;
  const comp = clamp01(0.25 + (hardness != null ? hardness / 25 : 0.1));
  return {
    compressiveSuitability: comp,
    tensileSuitability: tensile,
    thermalMass: density != null ? thermalMassFromDensity(density) : 0.25,
    weatherResistance: hardness != null ? weatherFromHardness(hardness) * 0.85 : 0.35,
    earthworkSuitability: 0,
  };
}

function inferFromEarthClay(resource: Resource): Partial<BuildingStructuralAffordance> {
  return {
    compressiveSuitability: 0.35,
    tensileSuitability: 0.08,
    thermalMass: 0.55,
    weatherResistance: 0.25,
    earthworkSuitability: 0.85,
  };
}

function inferFromThatchFibre(resource: Resource): Partial<BuildingStructuralAffordance> {
  const density = getNumericProperty(resource, 'density');
  return {
    compressiveSuitability: 0.08,
    tensileSuitability: density != null && density < 400 ? 0.45 : 0.35,
    thermalMass: 0.12,
    weatherResistance: 0.15,
    earthworkSuitability: 0,
  };
}

/**
 * Derives structural affordance from a Resource's properties and type strings.
 * Ores and unfinished metals score as poor primary structure unless properties suggest otherwise.
 */
export function inferStructuralAffordance(resource: Resource): BuildingStructuralAffordance {
  const major = resource.major_type.toLowerCase();
  const minor = resource.minor_type.toLowerCase();

  let partial: Partial<BuildingStructuralAffordance> = {};

  if (major === 'metal' && minor.includes('ore')) {
    partial = inferFromMetalOre(resource);
  } else if (major === 'stone') {
    partial = inferFromStone(resource);
  } else if (major === 'wood' || major === 'timber' || major === 'bamboo') {
    partial = inferFromWood(resource);
  } else if (major === 'earth' || major === 'clay' || minor.includes('adobe')) {
    partial = inferFromEarthClay(resource);
  } else if (major === 'thatch' || major === 'fibre' || major === 'straw') {
    partial = inferFromThatchFibre(resource);
  } else if (major === 'brick' || major === 'ceramic') {
    partial = {
      compressiveSuitability: 0.55,
      tensileSuitability: 0.1,
      thermalMass: 0.6,
      weatherResistance: 0.45,
      earthworkSuitability: 0.1,
    };
  } else if (major === 'lime' || major === 'gypsum') {
    partial = {
      compressiveSuitability: 0.15,
      tensileSuitability: 0.05,
      thermalMass: 0.35,
      weatherResistance: 0.2,
      earthworkSuitability: 0,
    };
  } else {
    partial = inferFromMetalOre(resource);
  }

  const compressiveSuitability = clamp01(partial.compressiveSuitability ?? 0.3);
  const tensileSuitability = clamp01(partial.tensileSuitability ?? 0.2);
  const thermalMass = clamp01(partial.thermalMass ?? 0.35);
  const weatherResistance = clamp01(partial.weatherResistance ?? 0.3);
  const earthworkSuitability = clamp01(partial.earthworkSuitability ?? 0);

  const spanCategory: SpanCategory = spanFromFlexuralHint(tensileSuitability, major);

  const roles = rolesForMajorMinor(major, minor, compressiveSuitability, tensileSuitability);

  return {
    roles: roles.length > 0 ? roles : ['enclosure'],
    compressiveSuitability,
    tensileSuitability,
    spanCategory,
    earthworkSuitability,
    thermalMass,
    weatherResistance,
  };
}
