import { describe, expect, it } from 'vitest';
import type { RegionMap } from '$lib/map';
import { emptyRegionFacts, regionFactsError } from './region_facts';
import type { RegionFacts } from './region_fact_types';
const map = {
  width: 10,
  height: 10,
  nodes: [{ id: 1, isWater: false, isOcean: false }],
  edges: [],
  corners: [],
} as unknown as RegionMap;
function facts(): RegionFacts {
  return {
    ...emptyRegionFacts('current'),
    areas: [
      { id: 'area:land', name: 'Land', description: '', origin: 'generated', mapNodeIds: [1] },
    ],
    geology: [
      {
        id: 'geology:one',
        name: 'Province',
        description: '',
        origin: 'generated',
        areaIds: ['area:land'],
        anchor: { nodeIds: [1], edgeIds: [] },
        setting: {
          hostRocks: ['shale', 'sandstone', 'evaporite'],
          processes: ['petroleum'],
          petroleum: {
            sourceRock: 'shale',
            reservoirRock: 'sandstone',
            sealRock: 'evaporite',
            maturity: 'gas-window',
            trapped: true,
          },
        },
      },
    ],
    resourceDeposits: [
      {
        id: 'deposit:one',
        name: 'Gas',
        description: '',
        origin: 'generated',
        geologyId: 'geology:one',
        resourceName: 'natural gas',
        category: 'gas',
        concentration: 'workable',
        exposure: 'deep',
        extraction: 'drilling',
        anchor: { nodeIds: [1], edgeIds: [] },
      },
    ],
    resources: [
      {
        id: 'resource:gas',
        name: 'Gas',
        description: '',
        origin: 'generated',
        kind: 'gas',
        availability: 'limited',
        depositIds: ['deposit:one'],
        areaIds: ['area:land'],
        habitatIds: [],
        catalogSource: { kind: 'geological-resource', resourceName: 'natural gas' },
      },
    ],
  };
}
describe('geological payload invariants', () => {
  it('validates saved deposits and permits unresolved future catalog vocabulary', () => {
    const value = facts();
    expect(regionFactsError(value, map, [])).toBeNull();
    value.resourceDeposits[0].resourceName = 'future gas';
    value.resources[0].catalogSource!.resourceName = 'future gas';
    expect(regionFactsError(value, map, [])).toBeNull();
    value.geology[0].setting.petroleum = undefined;
    value.geology[0].setting.processes = [];
    expect(regionFactsError(value, map, [])).toBeNull();
    value.resources[0].catalogSource = {
      kind: 'species-product',
      speciesName: 'future species',
      resourceName: 'future gas',
    };
    expect(regionFactsError(value, map, [])).not.toBeNull();
  });
  it.each([
    [
      'invalid geology location',
      (value: RegionFacts) => {
        value.geology[0].anchor.nodeIds = [99];
      },
    ],
    [
      'unknown area',
      (value: RegionFacts) => {
        value.geology[0].areaIds = ['missing'];
      },
    ],
    [
      'unknown process',
      (value: RegionFacts) => {
        value.geology[0].setting.processes = ['wrong'] as never;
      },
    ],
    [
      'invalid setting',
      (value: RegionFacts) => {
        value.geology[0].setting = null as never;
      },
    ],
    [
      'invalid petroleum',
      (value: RegionFacts) => {
        value.geology[0].setting.petroleum!.sealRock = 'unknown';
      },
    ],
    [
      'unknown maturity',
      (value: RegionFacts) => {
        value.geology[0].setting.petroleum!.maturity = 'wrong' as never;
      },
    ],
    [
      'missing petroleum process',
      (value: RegionFacts) => {
        value.geology[0].setting.processes = [];
      },
    ],
    [
      'unknown province',
      (value: RegionFacts) => {
        value.resourceDeposits[0].geologyId = 'geology:missing';
      },
    ],
    [
      'outside province',
      (value: RegionFacts) => {
        value.resourceDeposits[0].anchor.nodeIds = [99];
      },
    ],
    [
      'unknown category',
      (value: RegionFacts) => {
        value.resourceDeposits[0].category = 'wrong' as never;
      },
    ],
    [
      'unknown concentration',
      (value: RegionFacts) => {
        value.resourceDeposits[0].concentration = 'wrong' as never;
      },
    ],
    [
      'surface drilling',
      (value: RegionFacts) => {
        value.resourceDeposits[0].exposure = 'surface';
      },
    ],
    [
      'hydrocarbon mining',
      (value: RegionFacts) => {
        value.resourceDeposits[0].extraction = 'mining';
      },
    ],
    [
      'deep gathering',
      (value: RegionFacts) => {
        value.resourceDeposits[0].category = 'stone';
        value.resourceDeposits[0].extraction = 'gathering';
      },
    ],
    [
      'invalid availability',
      (value: RegionFacts) => {
        value.resources[0].availability = 'wrong' as never;
      },
    ],
    [
      'unknown deposit',
      (value: RegionFacts) => {
        value.resources[0].depositIds = ['deposit:missing'];
      },
    ],
    [
      'mismatched category',
      (value: RegionFacts) => {
        value.resources[0].kind = 'stone';
      },
    ],
    [
      'invalid catalog',
      (value: RegionFacts) => {
        value.resources[0].catalogSource = { kind: 'wrong' } as never;
      },
    ],
    [
      'missing species identity',
      (value: RegionFacts) => {
        value.resources[0].catalogSource = {
          kind: 'species-product',
          resourceName: 'natural gas',
        } as never;
      },
    ],
    [
      'catalog mismatch',
      (value: RegionFacts) => {
        value.resources[0].catalogSource!.resourceName = 'oil';
      },
    ],
    [
      'trace positive supply',
      (value: RegionFacts) => {
        value.resourceDeposits[0].concentration = 'trace';
      },
    ],
    [
      'ungrounded positive supply',
      (value: RegionFacts) => {
        value.resources[0].depositIds = [];
      },
    ],
  ])('rejects %s', (_name, change) => {
    const value = facts();
    change(value);
    expect(regionFactsError(value, map, [])).not.toBeNull();
  });
});
