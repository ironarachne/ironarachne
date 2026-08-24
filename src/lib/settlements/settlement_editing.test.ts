import { describe, expect, it } from 'vitest';

import {
  addSettlementProblem,
  SETTLEMENT_ECONOMIC_ROLES,
  setSettlementCategoryName,
  setSettlementEconomicRole,
  setSettlementEnvironmentDescription,
  setSettlementTags,
  removeSettlementNotable,
  removeSettlementProblem,
  setSettlementCount,
  setSettlementFacet,
  setSettlementNotableField,
  setSettlementNotableName,
  setSettlementOrganizationField,
  setSettlementProblem,
  setSettlementText,
  setSettlementTradeList,
} from './settlement_editing';
import { rollSettlement } from './settlement_roll';
import { toSettlementSnapshot, type SettlementSnapshot } from './settlement_snapshot';

const EVERY_LAYER = {
  size: 'large',
  includeTrade: true,
  includeProblems: true,
  includeOrganizations: true,
  includeNotables: true,
} as const;

function enriched(): SettlementSnapshot {
  return toSettlementSnapshot(rollSettlement('greyhaven', EVERY_LAYER).settlement);
}

function plain(): SettlementSnapshot {
  return toSettlementSnapshot(rollSettlement('greyhaven').settlement);
}

describe('setSettlementText', () => {
  it('renames a settlement without touching anything else', () => {
    const before = enriched();
    const after = setSettlementText(before, 'name', 'Saltmarch');
    expect(after.name).toBe('Saltmarch');
    expect({ ...after, name: before.name }).toEqual(before);
  });

  it('rewrites the description', () => {
    const after = setSettlementText(plain(), 'description', 'A wet town on a slow river.');
    expect(after.description).toBe('A wet town on a slow river.');
  });

  it('changes nothing in place', () => {
    const before = enriched();
    setSettlementText(before, 'name', 'Saltmarch');
    expect(before.name).not.toBe('Saltmarch');
  });
});

describe('the fields a settlement leads with', () => {
  it('renames the size band without moving the band', () => {
    const before = plain();
    const after = setSettlementCategoryName(before, 'port city');
    expect(after.category.name).toBe('port city');
    expect(after.category.minSize).toBe(before.category.minSize);
    expect(after.category.maxSize).toBe(before.category.maxSize);
  });

  it('sets an economic role from the table', () => {
    expect(setSettlementEconomicRole(plain(), 'extractive').economicRole).toBe('extractive');
    expect(SETTLEMENT_ECONOMIC_ROLES).toContain('mixed');
  });

  it('refuses a role that is not one', () => {
    const before = plain();
    expect(setSettlementEconomicRole(before, 'piratical')).toEqual(before);
  });

  it('rewrites the environment description', () => {
    const after = setSettlementEnvironmentDescription(plain(), 'Wet fenland under low cloud.');
    expect(after.environment.description).toBe('Wet fenland under low cloud.');
  });

  it('reads the hook tags as a comma-separated line, dropping blanks', () => {
    expect(setSettlementTags(plain(), 'river_trade, highland,,').settlementTags).toEqual([
      'river_trade',
      'highland',
    ]);
  });
});

describe('setSettlementFacet', () => {
  it('sets a facet', () => {
    expect(setSettlementFacet(plain(), 'commerce', 7).commerce).toBe(7);
  });

  it.each([
    [-3, 0],
    [42, 10],
    [4.6, 5],
  ])('clamps and rounds %s onto the scale it is displayed on', (given, expected) => {
    expect(setSettlementFacet(plain(), 'lawAndOrder', given).lawAndOrder).toBe(expected);
  });

  it('ignores a value that is not a number', () => {
    const before = plain();
    expect(setSettlementFacet(before, 'publicHealth', Number.NaN)).toEqual(before);
  });
});

describe('setSettlementCount', () => {
  it('sets a population, rounded', () => {
    expect(setSettlementCount(plain(), 'population', 1200.4).population).toBe(1200);
  });

  it('refuses a negative population rather than storing one', () => {
    const before = plain();
    expect(setSettlementCount(before, 'population', -5)).toEqual(before);
  });
});

describe('settlement problems', () => {
  /** Requirement 4.4: one problem is rewritten and the rest of the list does not move. */
  it('rewrites one problem, leaving the others alone', () => {
    const before = enriched();
    const others = (before.creepingProblems ?? []).slice(1);
    const after = setSettlementProblem(
      before,
      'creepingProblems',
      0,
      'summary',
      'The well is dry.',
    );
    expect(after.creepingProblems?.[0]?.summary).toBe('The well is dry.');
    expect(after.creepingProblems?.slice(1)).toEqual(others);
    expect(after.acuteProblems).toEqual(before.acuteProblems);
  });

  it('rewrites a problem detail', () => {
    const after = setSettlementProblem(
      enriched(),
      'acuteProblems',
      0,
      'detail',
      'Since midwinter.',
    );
    expect(after.acuteProblems?.[0]?.detail).toBe('Since midwinter.');
  });

  it.each([-1, 99, 1.5])('changes nothing at index %s', (index) => {
    const before = enriched();
    expect(setSettlementProblem(before, 'acuteProblems', index, 'summary', 'x')).toEqual(before);
    expect(removeSettlementProblem(before, 'acuteProblems', index)).toEqual(before);
  });

  it('adds a blank problem of the right kind', () => {
    const after = addSettlementProblem(enriched(), 'creepingProblems');
    const added = after.creepingProblems?.at(-1);
    expect(added).toEqual({ kind: 'creeping', summary: '' });
  });

  /**
   * A settlement rolled without problems is a shape of this kind, not one missing something. It is
   * still allowed to grow a problem the user writes by hand.
   */
  it('adds a problem to a settlement that had no list at all', () => {
    const before = plain();
    expect(before.acuteProblems).toBeUndefined();
    const after = addSettlementProblem(before, 'acuteProblems', 'The mill has stopped.');
    expect(after.acuteProblems).toEqual([{ kind: 'acute', summary: 'The mill has stopped.' }]);
  });

  it('removes one problem and keeps the rest', () => {
    const before = addSettlementProblem(enriched(), 'acuteProblems', 'A second thing.');
    const after = removeSettlementProblem(before, 'acuteProblems', 0);
    expect(after.acuteProblems).toEqual((before.acuteProblems ?? []).slice(1));
  });
});

describe('setSettlementTradeList', () => {
  it('reads a comma-separated line as a list of goods', () => {
    const after = setSettlementTradeList(enriched(), 'primaryExports', 'salt, timber,  wool ');
    expect(after.primaryExports).toEqual(['salt', 'timber', 'wool']);
  });

  it('drops the blank a trailing comma leaves behind', () => {
    const after = setSettlementTradeList(enriched(), 'primaryImports', 'iron,,');
    expect(after.primaryImports).toEqual(['iron']);
  });

  /** A settlement with no trade layer does not grow one from an edit to a field it never shows. */
  it('leaves a settlement with no trade layer alone', () => {
    const before = plain();
    expect(setSettlementTradeList(before, 'primaryExports', 'salt')).toEqual(before);
  });
});

describe('settlement notables', () => {
  it('rewrites one notable’s title and importance, leaving the others alone', () => {
    const before = enriched();
    const others = (before.importantPeople ?? []).slice(1);
    const titled = setSettlementNotableField(before, 0, 'roleDisplay', 'Harbourmaster');
    const after = setSettlementNotableField(titled, 0, 'importance', 'Holds the tide charts.');
    expect(after.importantPeople?.[0]?.roleDisplay).toBe('Harbourmaster');
    expect(after.importantPeople?.[0]?.importance).toBe('Holds the tide charts.');
    expect(after.importantPeople?.slice(1)).toEqual(others);
  });

  it('renames the person holding the role', () => {
    const first = setSettlementNotableName(enriched(), 0, 'firstName', 'Maren');
    const after = setSettlementNotableName(first, 0, 'lastName', 'Voss');
    expect(after.importantPeople?.[0]?.character.firstName).toBe('Maren');
    expect(after.importantPeople?.[0]?.character.lastName).toBe('Voss');
    // The rest of the character record is untouched; a rename is a rename.
    expect(after.importantPeople?.[0]?.character.species).toEqual(
      enriched().importantPeople?.[0]?.character.species,
    );
  });

  it('removes a notable', () => {
    const before = enriched();
    const kept = (before.importantPeople ?? []).slice(1);
    expect(removeSettlementNotable(before, 0).importantPeople).toEqual(kept);
  });

  it.each([-1, 99])('changes nothing at index %s', (index) => {
    const before = enriched();
    expect(setSettlementNotableField(before, index, 'importance', 'x')).toEqual(before);
    expect(setSettlementNotableName(before, index, 'firstName', 'x')).toEqual(before);
    expect(removeSettlementNotable(before, index)).toEqual(before);
  });

  it('leaves a settlement with no notables alone', () => {
    const before = plain();
    expect(setSettlementNotableField(before, 0, 'importance', 'x')).toEqual(before);
  });
});

describe('setSettlementOrganizationField', () => {
  it('renames an organization', () => {
    const after = setSettlementOrganizationField(enriched(), 0, 'name', 'The Salt Ledger');
    expect(after.organizations?.[0]?.name).toBe('The Salt Ledger');
  });

  it('rewrites the line the settlement introduces one with', () => {
    const before = enriched();
    const after = setSettlementOrganizationField(before, 0, 'hook', 'They own the wharf.');
    expect(after.organizations?.[0]?.profile.hook).toBe('They own the wharf.');
    // The rest of the profile is generated content the hook is only one line of.
    expect(after.organizations?.[0]?.profile.goal).toEqual(before.organizations?.[0]?.profile.goal);
  });

  it.each([-1, 99])('changes nothing at index %s', (index) => {
    const before = enriched();
    expect(setSettlementOrganizationField(before, index, 'name', 'x')).toEqual(before);
  });

  it('leaves a settlement with no organizations alone', () => {
    const before = plain();
    expect(setSettlementOrganizationField(before, 0, 'name', 'x')).toEqual(before);
  });
});
