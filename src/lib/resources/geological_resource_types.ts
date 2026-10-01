import type { GeologicalProcess } from '$lib/environment';
import type { Resource } from './resource_types';
export type GeologicalResourceCategory =
  | 'metal-ore'
  | 'gemstone'
  | 'stone'
  | 'industrial-mineral'
  | 'oil'
  | 'gas';
export type DepositConcentration = 'trace' | 'workable' | 'rich';
export type DepositExposure = 'surface' | 'shallow' | 'deep';
export type ExtractionMethod = 'gathering' | 'quarrying' | 'mining' | 'drilling';
export type GeologicalResourceDefinition = {
  resource: Resource;
  category: GeologicalResourceCategory;
  hostRocks: string[];
  processes: GeologicalProcess[];
  extractionMethods: ExtractionMethod[];
};
