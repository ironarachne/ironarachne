import type {
  ArchitectureValidation,
  GenerateArchitecturalStyleConfig,
  ArchitectureResources,
} from './architecture_types';
import { MATERIAL_FORMS } from './architecture_material_policy';
import {
  climateShape,
  contextShape,
  finite,
  list,
  MOTIFS,
  oneOf,
  record,
  siteShape,
  strings,
  text,
  uniqueIds,
  validation,
} from './architecture_schema';

function resourceInputShape(v: unknown): boolean {
  if (
    !record(v) ||
    !text(v.id) ||
    !oneOf(v.form, MATERIAL_FORMS) ||
    !oneOf(v.availability, ['available', 'limited', 'not-observed', 'unknown']) ||
    !oneOf(v.origin, ['local', 'imported', 'salvaged', 'native']) ||
    !strings(v.evidenceIds) ||
    !record(v.resource)
  )
    return false;
  const r = v.resource;
  return (
    ['name', 'description', 'major_type', 'minor_type'].every((k) => text(r[k])) &&
    typeof r.is_refineable === 'boolean' &&
    finite(r.commonality) &&
    r.commonality >= 0 &&
    list(
      r.properties,
      (p) => record(p) && text(p.name) && text(p.description) && (text(p.value) || finite(p.value)),
    ) &&
    (v.form !== 'native_rock' || v.origin === 'native')
  );
}
/** Public generation boundaries accept unknown at runtime, even when TypeScript callers are typed. */
export function validateArchitectureConfig(value: unknown): ArchitectureValidation {
  if (
    !record(value) ||
    !text(value.seed) ||
    !record(value.biome) ||
    !text(value.biome.name) ||
    !['temperature', 'humidity', 'altitude'].every((k) =>
      finite((value.biome as Record<string, unknown>)[k]),
    ) ||
    typeof value.biome.isAquatic !== 'boolean' ||
    !finite(value.biome.humidity) ||
    value.biome.humidity < 0 ||
    value.biome.humidity > 1 ||
    !siteShape(value.site) ||
    (value.climate !== undefined && !climateShape(value.climate)) ||
    !record(value.resources) ||
    !oneOf(value.resources.knowledge, ['known', 'unknown']) ||
    !list(value.resources.entries, resourceInputShape) ||
    (value.resources.knowledge === 'unknown' &&
      (value.resources.entries as unknown[]).length !== 0) ||
    !list(value.contexts, contextShape) ||
    !Array.isArray(value.contexts) ||
    value.contexts.length === 0 ||
    !list(
      value.culturalPreferences,
      (p) =>
        record(p) &&
        text(p.id) &&
        oneOf(p.motif, MOTIFS) &&
        finite(p.weight) &&
        p.weight >= 0 &&
        p.weight <= 2,
    )
  )
    return validation(false);
  const config = value as unknown as GenerateArchitecturalStyleConfig;
  return validation(
    uniqueIds(config.resources.entries) &&
      uniqueIds(config.contexts) &&
      uniqueIds(config.culturalPreferences) &&
      config.resources.entries.every(
        (e) =>
          new Set(e.resource.properties.map((p) => p.name)).size === e.resource.properties.length,
      ),
  );
}

export function validateArchitectureResources(value: unknown): value is ArchitectureResources {
  return (
    record(value) &&
    oneOf(value.knowledge, ['known', 'unknown']) &&
    list(value.entries, resourceInputShape) &&
    (value.knowledge !== 'unknown' || (value.entries as unknown[]).length === 0) &&
    uniqueIds(value.entries as ArchitectureResources['entries'])
  );
}
