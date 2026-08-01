import { describe, expect, it } from 'vitest';
import {
  addRandomRivalryBetweenPairs,
  type OrganizationRelationship,
} from './organization_relationships';

/** Returns the scripted values in order, then repeats the last one. */
function scriptedRng(...values: number[]) {
  let i = 0;
  return {
    int: () => values[Math.min(i++, values.length - 1)],
  };
}

function orgs(count: number): { id: string; relationships: OrganizationRelationship[] }[] {
  return Array.from({ length: count }, (_, i) => ({ id: `org-${i}`, relationships: [] }));
}

describe('addRandomRivalryBetweenPairs', () => {
  it('does nothing with fewer than two organizations', () => {
    const single = orgs(1);
    addRandomRivalryBetweenPairs(single, scriptedRng(0, 0, 0));
    expect(single[0].relationships).toEqual([]);
  });

  it('declines most of the time', () => {
    const pair = orgs(2);
    addRandomRivalryBetweenPairs(pair, scriptedRng(41));
    expect(pair.every((o) => o.relationships.length === 0)).toBe(true);
  });

  it('records the rivalry on both sides when it fires', () => {
    const pair = orgs(2);
    addRandomRivalryBetweenPairs(pair, scriptedRng(40, 0, 1));

    expect(pair[0].relationships).toEqual([{ relatedOrganizationId: 'org-1', kind: 'rival' }]);
    expect(pair[1].relationships).toEqual([{ relatedOrganizationId: 'org-0', kind: 'rival' }]);
  });

  it('will not pair an organization with itself', () => {
    const pair = orgs(2);
    /* Every draw picks index 0, so the retry guard runs out and nothing is linked. */
    addRandomRivalryBetweenPairs(pair, scriptedRng(10, 0));
    expect(pair.every((o) => o.relationships.length === 0)).toBe(true);
  });

  it('does not add a second edge between an already-linked pair', () => {
    const pair = orgs(2);
    pair[0].relationships.push({ relatedOrganizationId: 'org-1', kind: 'rival' });
    pair[1].relationships.push({ relatedOrganizationId: 'org-0', kind: 'rival' });

    addRandomRivalryBetweenPairs(pair, scriptedRng(10, 0, 1));

    expect(pair[0].relationships).toHaveLength(1);
    expect(pair[1].relationships).toHaveLength(1);
  });

  it('leaves an unrelated existing relationship alone', () => {
    const three = orgs(3);
    three[0].relationships.push({ relatedOrganizationId: 'org-2', kind: 'allied' });

    addRandomRivalryBetweenPairs(three, scriptedRng(10, 0, 1));

    expect(three[0].relationships).toEqual([
      { relatedOrganizationId: 'org-2', kind: 'allied' },
      { relatedOrganizationId: 'org-1', kind: 'rival' },
    ]);
    expect(three[2].relationships).toEqual([]);
  });
});
