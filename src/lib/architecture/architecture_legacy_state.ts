import type { ArchitectureState } from './architecture_types';
export function legacyArchitectureState(): ArchitectureState {
  return { kind: 'legacy', style: null, examples: [], summary: null, diagnostics: [] };
}
