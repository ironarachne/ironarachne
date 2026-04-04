import { describe, it, expect } from 'vitest';
import { domains } from '../domains/domain_data';
import { deityMutators } from './deity_data';

function getMatchingMutators(tags: string[], mutators: { tags: string[] }[]): any[] {
  return mutators.filter((mutator) => mutator.tags.some((tag) => tags.includes(tag)));
}

describe('Domain mutator coverage', () => {
  it('should have at least one matching deity mutator for each domain', () => {
    const failures: { domain: string; tags: string[] }[] = [];
    for (const domain of domains) {
      const matches = getMatchingMutators(domain.tags, deityMutators);
      if (matches.length === 0) {
        failures.push({ domain: domain.name, tags: domain.tags });
      }
    }
    expect(
      failures,
      failures
        .map(
          (f) => `Domain '${f.domain}' has no matching mutators for tags: [${f.tags.join(', ')}].`,
        )
        .join('\n'),
    ).toHaveLength(0);
  });
});
