import { RNG } from '@ironarachne/rng';
import type {
  ArchitectureResult,
  ArchitecturalStyle,
  GenerateArchitecturalStyleConfig,
} from './architecture_types';
import { compareArchitectureIds, normalizeArchitectureMaterials } from './architecture_materials';
import { architectureOperationSeed } from './architecture_policy';
import { generateArchitectureProfile } from './architecture_profiles';
import { validateArchitectureConfig } from './architecture_input_validation';
import { validateArchitecturalStyle } from './architecture_validation';

/** Stable key ordering before a compact, non-security provenance fingerprint. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  return value;
}
function fingerprint(value: unknown): string {
  let hash = 14695981039346656037n;
  for (const char of JSON.stringify(canonical(value))) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * 1099511628211n);
  }
  return `v1:${hash.toString(16).padStart(16, '0')}`;
}
function inputFingerprint(config: GenerateArchitecturalStyleConfig): string {
  const entries = [...config.resources.entries].sort(compareArchitectureIds).map((e) => ({
    ...e,
    evidenceIds: [...e.evidenceIds].sort(),
    resource: {
      ...e.resource,
      name: '',
      description: '',
      properties: [...e.resource.properties]
        .map((p) => ({ name: p.name, value: p.value }))
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
    },
  }));
  return fingerprint({
    version: 1,
    biome: {
      temperature: config.biome.temperature,
      humidity: config.biome.humidity,
      altitude: config.biome.altitude,
      isAquatic: config.biome.isAquatic,
    },
    climate: config.climate
      ? {
          ...config.climate,
          name: '',
          description: '',
          seasons: config.climate.seasons.map((season) => ({ ...season, name: '' })),
        }
      : undefined,
    site: config.site,
    resources: { knowledge: config.resources.knowledge, entries },
    contexts: [...config.contexts].sort(compareArchitectureIds),
    preferences: [...config.culturalPreferences].sort(compareArchitectureIds),
  });
}
export function generateArchitecturalStyle(
  config: GenerateArchitecturalStyleConfig,
): ArchitectureResult {
  const validated = validateArchitectureConfig(config);
  if (!validated.ok) return { status: 'invalid', style: null, diagnostics: validated.diagnostics };
  if (config.biome.isAquatic)
    return {
      status: 'unavailable',
      style: null,
      diagnostics: [{ code: 'unsupported_context', contextId: null, resourceIds: [] }],
    };
  const materials = normalizeArchitectureMaterials(config.resources.entries);
  const profiles = [...config.contexts].sort(compareArchitectureIds).flatMap((context) => {
    const profile = generateArchitectureProfile(
      config,
      context,
      materials,
      new RNG(architectureOperationSeed(config.seed, 'profile', context.id)),
    );
    return profile ? [profile] : [];
  });
  const diagnostics: ArchitectureResult['diagnostics'] = config.contexts
    .filter((c) => !profiles.some((p) => p.id === c.id))
    .sort(compareArchitectureIds)
    .map((c) => ({
      code:
        config.resources.knowledge === 'unknown' ? 'unknown_resources' : 'insufficient_resources',
      contextId: c.id,
      resourceIds: config.resources.entries.map((e) => e.id).sort(),
    }));
  for (const entry of config.resources.entries
    .filter((e) => e.form === 'unknown')
    .sort(compareArchitectureIds))
    diagnostics.push({ code: 'unknown_material_form', contextId: null, resourceIds: [entry.id] });
  if (!profiles.length && config.resources.knowledge === 'known')
    return { status: 'unavailable', style: null, diagnostics };
  const used = new Set(
    profiles.flatMap((p) => [
      p.primaryMaterialId,
      ...p.frameMaterialIds,
      ...p.leafMaterialIds,
      ...p.variants.flatMap((v) => [
        v.supportMaterialId,
        v.roof?.structureMaterialId,
        v.roof?.coveringMaterialId,
        v.windows?.fillMaterialId,
        v.windows?.shutterMaterialId,
        ...v.surfaces.flatMap((s) => [s.materialId, s.finishMaterialId]),
        ...v.features.map((f) => f.materialId),
      ]),
    ]),
  );
  const style: ArchitecturalStyle = {
    schemaVersion: 1,
    generatorVersion: 1,
    id: architectureOperationSeed(config.seed, 'style', 'root'),
    seed: config.seed,
    origin: {
      biomeName: config.biome.name,
      temperature: config.biome.temperature,
      humidity: config.biome.humidity,
      altitude: config.biome.altitude,
      isAquatic: config.biome.isAquatic,
      ...(config.climate ? { climate: structuredClone(config.climate) } : {}),
      site: structuredClone(config.site),
      resourceKnowledge: config.resources.knowledge,
      inputFingerprint: inputFingerprint(config),
    },
    materials: materials.filter((m) => used.has(m.id)),
    profiles,
  };
  const valid = validateArchitecturalStyle(style);
  if (!valid.ok) return { status: 'invalid', style: null, diagnostics: valid.diagnostics };
  return {
    status: profiles.length === config.contexts.length ? 'complete' : 'partial',
    style,
    diagnostics,
  };
}
