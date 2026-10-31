import { RNG } from '@ironarachne/rng';
import { composeNarrative } from '$lib/narrative';
import type {
  ArchitectureResult,
  ArchitectureState,
  GenerateArchitecturalStyleConfig,
} from './architecture_types';
import { generateArchitecturalStyle } from './architecture_generation';
import { instantiateArchitecture } from './architecture_instances';
import { architectureNarrativeSubject } from './architecture_narrative';
import { architectureOperationSeed } from './architecture_policy';
export { legacyArchitectureState } from './architecture_legacy_state';
export const UNKNOWN_ARCHITECTURAL_SITE = {
  substrate: null,
  relief: null,
  coastal: null,
  floodProne: null,
};
export function architectureStateFromResult(result: ArchitectureResult): ArchitectureState {
  if (result.status === 'invalid') throw new Error('Invalid architectural generation inputs');
  if (!result.style)
    return {
      kind: 'unavailable',
      style: null,
      examples: [],
      summary: null,
      diagnostics: result.diagnostics,
    };
  return {
    kind: result.status === 'complete' ? 'generated' : 'partial',
    style: result.style,
    examples: [],
    summary: null,
    diagnostics: result.diagnostics,
  };
}
/** The owner calls this once at generation time. Reads and renderers use the saved result. */
export function generateArchitectureState(
  config: GenerateArchitecturalStyleConfig,
  exampleCount = 0,
): ArchitectureState {
  if (!Number.isInteger(exampleCount) || exampleCount < 0 || exampleCount > 12)
    throw new Error('Architecture example count must be between zero and twelve');
  const state = architectureStateFromResult(generateArchitecturalStyle(config));
  if (!state.style) return state;
  const profile = state.style.profiles.find(
    (p) => p.context.construction === 'built' && p.context.exposure !== 'buried',
  );
  if (profile)
    for (let index = 0; index < exampleCount; index++) {
      const result = instantiateArchitecture(
        state.style,
        {
          id: `building-${index}`,
          profileId: profile.id,
          currentPurpose: profile.context.purpose,
          shape: 'free',
          widthDepthRatio: null,
          condition: 'unspecified',
          placedFeatureIds: [],
          connections: [],
        },
        config.seed,
      );
      if (result.ok) state.examples.push(result.value);
      else state.diagnostics.push(...result.diagnostics);
    }
  state.summary =
    composeNarrative(
      architectureNarrativeSubject(state.style, null, state.style.id),
      { maxSentences: 2, maxPerTopic: 2, repetitionWindow: 0 },
      { recentSelections: [] },
      new RNG(architectureOperationSeed(config.seed, 'prose', 'summary')),
    ).text || null;
  return state;
}
