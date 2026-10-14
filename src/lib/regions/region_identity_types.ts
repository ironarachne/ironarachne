import type { CausalFact } from './region_fact_types';

/** Transient selection data; only the existing causal fact is persisted. */
export type RegionIdentityCandidate = {
  fact: CausalFact;
  family: 'road-landscape' | 'settlement-forest' | 'resource-range';
  options: string[];
  conflicts: string[];
};
