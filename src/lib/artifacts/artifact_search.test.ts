import { describe, expect, it } from 'vitest';

import {
  artifactKindsOf,
  artifactTagsOf,
  groupArtifactsByKind,
  matchesArtifactQuery,
  searchArtifacts,
} from './artifact_search';
import type { ArtifactSummary } from './artifact_types';

function summaryOf(overrides: Partial<ArtifactSummary> = {}): ArtifactSummary {
  return {
    id: 'a1',
    projectId: 'p1',
    kind: 'culture',
    name: 'Ashfall',
    tags: [],
    references: [],
    payloadVersion: 1,
    byteSize: 128,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

const ashfall = summaryOf({ id: 'a1', name: 'Ashfall', kind: 'culture', tags: ['north', 'draft'] });
const dolmen = summaryOf({ id: 'a2', name: 'Dolmen Wood', kind: 'culture', tags: ['north'] });
const sunCult = summaryOf({ id: 'a3', name: 'Cult of the Sun', kind: 'religion', tags: ['draft'] });
const arms = summaryOf({ id: 'a4', name: 'Argent, a bend gules', kind: 'heraldry' });
const everything = [ashfall, dolmen, sunCult, arms];

describe('matchesArtifactQuery', () => {
  it('matches every term, in any order and anywhere in the name', () => {
    expect(matchesArtifactQuery(sunCult, 'sun cult')).toBe(true);
    expect(matchesArtifactQuery(sunCult, 'cult sun')).toBe(true);
  });

  it('matches the kind as well as the name', () => {
    expect(matchesArtifactQuery(arms, 'heraldry')).toBe(true);
  });

  it('is false when any term is absent', () => {
    expect(matchesArtifactQuery(sunCult, 'sun moon')).toBe(false);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(matchesArtifactQuery(ashfall, '  ASH  ')).toBe(true);
  });

  it('matches everything on a blank query', () => {
    expect(matchesArtifactQuery(ashfall, '   ')).toBe(true);
  });
});

describe('searchArtifacts', () => {
  it('returns everything when nothing narrows it', () => {
    expect(searchArtifacts(everything, {})).toEqual(everything);
  });

  it('narrows by kind', () => {
    expect(searchArtifacts(everything, { kind: 'culture' })).toEqual([ashfall, dolmen]);
  });

  it('narrows by query', () => {
    expect(searchArtifacts(everything, { query: 'wood' })).toEqual([dolmen]);
  });

  it('requires every tag given, not any of them', () => {
    expect(searchArtifacts(everything, { tags: ['north', 'draft'] })).toEqual([ashfall]);
  });

  it('does not narrow on an empty tag list', () => {
    expect(searchArtifacts(everything, { tags: [] })).toEqual(everything);
  });

  it('applies every criterion at once', () => {
    expect(searchArtifacts(everything, { kind: 'culture', tags: ['north'], query: 'ash' })).toEqual(
      [ashfall],
    );
  });

  it('can match nothing', () => {
    expect(searchArtifacts(everything, { query: 'nothing here' })).toEqual([]);
  });
});

describe('groupArtifactsByKind', () => {
  it('groups by kind, keeping the order the artifacts came in', () => {
    const groups = groupArtifactsByKind(everything, ['culture', 'religion', 'heraldry']);

    expect(groups).toEqual([
      { kind: 'culture', artifacts: [ashfall, dolmen] },
      { kind: 'religion', artifacts: [sunCult] },
      { kind: 'heraldry', artifacts: [arms] },
    ]);
  });

  it('leaves out kinds with nothing in them', () => {
    const groups = groupArtifactsByKind([sunCult], ['culture', 'religion']);

    expect(groups.map((group) => group.kind)).toEqual(['religion']);
  });

  it('sorts kinds the caller did not order after the ones it did, alphabetically', () => {
    const zebra = summaryOf({ id: 'a5', kind: 'zebra' });
    const alpaca = summaryOf({ id: 'a6', kind: 'alpaca' });

    const groups = groupArtifactsByKind([zebra, alpaca, sunCult], ['religion']);

    expect(groups.map((group) => group.kind)).toEqual(['religion', 'alpaca', 'zebra']);
  });

  it('falls back to alphabetical order when no order is given', () => {
    expect(groupArtifactsByKind(everything).map((group) => group.kind)).toEqual([
      'culture',
      'heraldry',
      'religion',
    ]);
  });

  it('is empty for an empty project', () => {
    expect(groupArtifactsByKind([])).toEqual([]);
  });
});

describe('artifactKindsOf', () => {
  it('lists each kind once, in encounter order', () => {
    expect(artifactKindsOf(everything)).toEqual(['culture', 'religion', 'heraldry']);
  });
});

describe('artifactTagsOf', () => {
  it('lists each tag once, alphabetically', () => {
    expect(artifactTagsOf(everything)).toEqual(['draft', 'north']);
  });

  it('is empty when nothing is tagged', () => {
    expect(artifactTagsOf([arms])).toEqual([]);
  });
});
