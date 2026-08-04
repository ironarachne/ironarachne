/**
 * The persisted half of the renderer decision: what a person chose, and nothing else.
 *
 * No measurement reaches `localStorage` — decision 6. This module is a record of a choice, not a
 * cache of a timing, and the shape it stores makes that hard to get wrong: there is nowhere to put
 * one.
 */

import { parseRendererBackend } from '$lib/renderers/renderer_backend';
import type { RenderQuality } from '$lib/renderers/astronomical_scene_types';
import type { RendererBackend } from '$lib/renderers/renderer_backend';
import type { RendererPreference } from '$lib/renderers/renderer_decision_types';

export const RENDERER_PREFERENCE_STORAGE_KEY = 'ironarachne.rendererPreference';

/**
 * The key this replaces, which held a bare backend name and no notion of "decide for me". A value
 * under it was written only when someone used the control, so it is read once as a deliberate
 * backend override and then removed.
 */
export const LEGACY_RENDERER_STORAGE_KEY = 'ironarachne.astronomicalRenderer';

function parseRenderQuality(raw: unknown): RenderQuality | undefined {
  if (raw === 'full') return 'full';
  if (raw === 'reduced') return 'reduced';
  return undefined;
}

function parseRendererPreference(raw: string | null): RendererPreference {
  if (raw === null) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};

    const record = parsed as Record<string, unknown>;
    const backendOverride = parseRendererBackend(
      typeof record.backendOverride === 'string' ? record.backendOverride : null,
    );
    const qualityOverride = parseRenderQuality(record.qualityOverride);

    return {
      ...(backendOverride === undefined ? {} : { backendOverride }),
      ...(qualityOverride === undefined ? {} : { qualityOverride }),
    };
  } catch {
    // Storage a person can edit is storage that can be malformed. "Decide for me" is the right
    // answer to unreadable preferences, and the next write replaces them.
    return {};
  }
}

/**
 * Reads the old key and, if it holds a backend name, returns it as an override. The migration
 * consumes the old value whether or not it was readable, so this runs at most once per browser.
 */
function migrateLegacyPreference(): RendererPreference {
  const legacy = localStorage.getItem(LEGACY_RENDERER_STORAGE_KEY);
  if (legacy === null) return {};

  localStorage.removeItem(LEGACY_RENDERER_STORAGE_KEY);
  const backendOverride = parseRendererBackend(legacy);
  if (backendOverride === undefined) return {};

  const migrated: RendererPreference = { backendOverride };
  writeRendererPreference(migrated);
  return migrated;
}

export function readRendererPreference(): RendererPreference {
  if (typeof localStorage === 'undefined') return {};

  const stored = localStorage.getItem(RENDERER_PREFERENCE_STORAGE_KEY);
  if (stored === null) return migrateLegacyPreference();

  return parseRendererPreference(stored);
}

/**
 * An empty preference is removed rather than written as `{}`, so "decide for me" leaves no trace —
 * the state a browser starts in and the state someone returns it to are the same state.
 */
export function writeRendererPreference(preference: RendererPreference): void {
  if (typeof localStorage === 'undefined') return;

  if (preference.backendOverride === undefined && preference.qualityOverride === undefined) {
    localStorage.removeItem(RENDERER_PREFERENCE_STORAGE_KEY);
    return;
  }

  localStorage.setItem(RENDERER_PREFERENCE_STORAGE_KEY, JSON.stringify(preference));
}

/** Sets or clears the backend override, leaving any quality override alone. */
export function writeBackendOverride(backendOverride: RendererBackend | undefined): void {
  writeRendererPreference({ ...readRendererPreference(), backendOverride });
}

/** Sets or clears the quality override, leaving any backend override alone. */
export function writeQualityOverride(qualityOverride: RenderQuality | undefined): void {
  writeRendererPreference({ ...readRendererPreference(), qualityOverride });
}
