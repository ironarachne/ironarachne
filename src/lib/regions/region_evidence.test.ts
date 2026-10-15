import { describe, expect, it } from 'vitest';
import { emptyRegionFacts } from './region_facts';
import { createProcessingEvidenceChecker, processingEvidenceCurrent } from './region_evidence';
import type { FactSource } from './region_fact_types';

describe('processing evidence traversal', () => {
  it('visits shared dependency evidence once per read operation, rather than once per path', () => {
    const facts = emptyRegionFacts('current');
    let reads = 0;
    for (let index = 0; index < 20; index++) {
      const sources: FactSource[] =
        index < 2
          ? []
          : [
              { kind: 'fact', factId: `area:${index - 1}` },
              { kind: 'fact', factId: `area:${index - 2}` },
            ];
      facts.areas.push({
        id: `area:${index}`,
        name: '',
        description: '',
        origin: 'authored',
        mapNodeIds: [],
        reason: {
          ruleId: 'test:evidence:v1',
          status: 'current',
          get sources() {
            reads++;
            return sources;
          },
        },
      });
    }
    const current = createProcessingEvidenceChecker(facts);
    expect(current(facts.areas.at(-1)!)).toBe(true);
    for (const area of facts.areas) expect(current(area)).toBe(true);
    expect(reads).toBe(20);
    // A synthetic candidate with a stored ID must not borrow that stored object's cached result.
    expect(
      current({
        ...facts.areas[0],
        reason: {
          ruleId: 'missing',
          status: 'current',
          sources: [{ kind: 'fact', factId: 'area:missing' }],
        },
      }),
    ).toBe(false);
  });
  it('rechecks edited evidence on the next operation and still rejects cycles', () => {
    const facts = emptyRegionFacts('current');
    facts.areas.push({
      id: 'area:one',
      name: '',
      description: '',
      origin: 'authored',
      mapNodeIds: [],
      reason: { ruleId: 'test', status: 'current', sources: [] },
    });
    const root = {
      id: 'area:root',
      name: '',
      description: '',
      origin: 'authored' as const,
      mapNodeIds: [],
      reason: {
        ruleId: 'test',
        status: 'current' as const,
        sources: [{ kind: 'fact' as const, factId: 'area:one' }],
      },
    };
    facts.areas.push(root);
    expect(processingEvidenceCurrent(root, facts)).toBe(true);
    facts.areas[0].reason!.status = 'stale';
    expect(processingEvidenceCurrent(root, facts)).toBe(false);
    facts.areas[0].reason!.status = 'current';
    facts.areas[0].reason!.sources = [{ kind: 'fact', factId: root.id }];
    expect(processingEvidenceCurrent(root, facts)).toBe(false);
    facts.areas[0].reason!.sources = [];
    expect(processingEvidenceCurrent(root, facts, new Set([root.id]))).toBe(false);
    expect(processingEvidenceCurrent(root, facts)).toBe(true);
  });
});
