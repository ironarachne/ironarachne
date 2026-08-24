import { describe, expect, it } from 'vitest';

import {
  readSettlementGeneratorConfig,
  rollSettlement,
  rollSettlementSnapshot,
} from './settlement_roll';

describe('readSettlementGeneratorConfig', () => {
  it('reads back what the generator records', () => {
    expect(
      readSettlementGeneratorConfig({
        nameGeneratorSet: 'dwarf',
        size: 'large',
        includeTrade: true,
        includeProblems: false,
        includeOrganizations: true,
        includeNotables: false,
      }),
    ).toEqual({
      nameGeneratorSet: 'dwarf',
      size: 'large',
      includeTrade: true,
      includeProblems: false,
      includeOrganizations: true,
      includeNotables: false,
    });
  });

  it('drops anything it does not recognise rather than coercing it', () => {
    expect(
      readSettlementGeneratorConfig({
        nameGeneratorSet: '',
        size: 'enormous',
        includeTrade: 'yes',
        includeProblems: 1,
        includeOrganizations: null,
        includeNotables: undefined,
      }),
    ).toEqual({});
  });

  it('reads an empty provenance as no settings at all', () => {
    expect(readSettlementGeneratorConfig({})).toEqual({});
  });
});

describe('rollSettlement', () => {
  /** Requirement 2.2: same seed, same configuration, same settlement. */
  it('is deterministic for a seed and a configuration', () => {
    const options = {
      nameGeneratorSet: 'dwarf',
      size: 'medium',
      includeTrade: true,
      includeProblems: true,
      includeNotables: true,
    } as const;
    expect(rollSettlement('anvil-deep', options)).toEqual(rollSettlement('anvil-deep', options));
  });

  it('rolls something else for a different seed', () => {
    const first = rollSettlement('anvil-deep', { nameGeneratorSet: 'dwarf' });
    const second = rollSettlement('salt-reach', { nameGeneratorSet: 'dwarf' });
    expect(first.settlement.name).not.toBe(second.settlement.name);
  });

  /**
   * Choosing a pattern set and having one chosen must produce the same settlement, which is why
   * the draw is taken off a seed of its own rather than the settlement's RNG. A draw on the main
   * stream would shift everything rolled after it, and "any set" would become a different
   * settlement rather than the same one under a named set.
   */
  it('resolves a set from the seed, and rolling under that name gives the same settlement', () => {
    const drawn = rollSettlement('oakhollow', { size: 'small' });
    expect(drawn.nameGeneratorSet).not.toBe('');
    expect(
      rollSettlement('oakhollow', { size: 'small', nameGeneratorSet: drawn.nameGeneratorSet }),
    ).toEqual(drawn);
  });

  it('falls back to a drawn set when the recorded one is not one this build has', () => {
    const rolled = rollSettlement('oakhollow', { size: 'small', nameGeneratorSet: 'sylvari' });
    expect(rolled.nameGeneratorSet).toBe(
      rollSettlement('oakhollow', { size: 'small' }).nameGeneratorSet,
    );
  });

  it('honours the size filter', () => {
    const small = rollSettlement('anvil-deep', { size: 'small' }).settlement;
    expect(small.category.sizeClass).toBe('small');
  });

  it('leaves every enrichment layer off unless asked', () => {
    const settlement = rollSettlement('anvil-deep').settlement;
    expect(settlement.tradeBlurb).toBeUndefined();
    expect(settlement.acuteProblems).toBeUndefined();
    expect(settlement.organizations).toBeUndefined();
    expect(settlement.importantPeople).toBeUndefined();
  });

  it('adds only the layers it is asked for', () => {
    const settlement = rollSettlement('anvil-deep', {
      size: 'medium',
      includeProblems: true,
    }).settlement;
    expect(settlement.acuteProblems?.length).toBeGreaterThan(0);
    expect(settlement.tradeBlurb).toBeUndefined();
    expect(settlement.importantPeople).toBeUndefined();
  });
});

describe('rollSettlementSnapshot', () => {
  /**
   * The destructive half of editing (requirement 4.3). Rolling an unedited settlement again has to
   * give the same one back, or "re-roll" would mean "lose this settlement" even for a user who
   * only wanted to undo an edit.
   */
  it('produces a payload equal to the one the same provenance first produced', () => {
    const options = { nameGeneratorSet: 'elf', size: 'large', includeNotables: true } as const;
    expect(rollSettlementSnapshot('greyhaven', options)).toEqual(
      rollSettlementSnapshot('greyhaven', options),
    );
  });

  it('produces a payload its own kind accepts', async () => {
    const { validateSettlementSnapshot } = await import('./settlement_artifact_kind');
    const rolled = rollSettlementSnapshot('greyhaven', {
      size: 'large',
      includeTrade: true,
      includeProblems: true,
      includeNotables: true,
    });
    expect(validateSettlementSnapshot(rolled).ok).toBe(true);
  });
});
