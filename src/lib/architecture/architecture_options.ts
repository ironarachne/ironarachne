import type { ArchitectureOptions } from './architecture_types';
import { validateArchitectureResources } from './architecture_input_validation';
import {
  contextShape,
  finite,
  list,
  MOTIFS,
  oneOf,
  record,
  siteShape,
  text,
  uniqueIds,
} from './architecture_schema';

/** Validate the serializable options shared by consumer provenance records without silently dropping choices. */
export function readArchitectureOptions(value: unknown): ArchitectureOptions | undefined {
  if (
    !record(value) ||
    !validateArchitectureResources(value.resources) ||
    (value.site !== undefined && !siteShape(value.site)) ||
    (value.culturalPreferences !== undefined &&
      !list(
        value.culturalPreferences,
        (p) =>
          record(p) &&
          text(p.id) &&
          oneOf(p.motif, MOTIFS) &&
          finite(p.weight) &&
          p.weight >= 0 &&
          p.weight <= 2,
      )) ||
    (value.contexts !== undefined &&
      (!list(value.contexts, contextShape) || (value.contexts as unknown[]).length === 0)) ||
    (value.roomProfiles !== undefined &&
      (!record(value.roomProfiles) || !Object.values(value.roomProfiles).every(text)))
  )
    return undefined;
  const options = value as unknown as ArchitectureOptions;
  if (
    (options.contexts && !uniqueIds(options.contexts)) ||
    (options.culturalPreferences && !uniqueIds(options.culturalPreferences))
  )
    return undefined;
  return {
    resources: structuredClone(options.resources),
    ...(options.site ? { site: structuredClone(options.site) } : {}),
    ...(options.contexts ? { contexts: structuredClone(options.contexts) } : {}),
    ...(options.culturalPreferences
      ? { culturalPreferences: structuredClone(options.culturalPreferences) }
      : {}),
    ...(options.roomProfiles ? { roomProfiles: { ...options.roomProfiles } } : {}),
  };
}
