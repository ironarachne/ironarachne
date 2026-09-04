import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  IRONARACHNE_RULESET_REF,
  RULESET_IDS,
  acceptedRuleset,
  addMechanicsVariant,
  allRulesDataSources,
  allRulesets,
  defineRulesDataSource,
  defineRuleset,
  deriveTreasureItemMechanics,
  getRuleset,
  mechanicsFor,
  migrateQualifiedMechanics,
  rejectedRuleset,
  rulesetNotices,
  sameRulesetRef,
  validateMechanicsSet,
  validateQualifiedMechanics,
  type MechanicsCodec,
  type QualifiedMechanics,
  type RulesDataSource,
  type RulesetDescriptor,
  type RulesetRef,
} from './index.js';

const genericItem: QualifiedMechanics = {
  ruleset: IRONARACHNE_RULESET_REF,
  subject: 'item',
  schemaVersion: 1,
  origin: 'migrated',
  sourceIds: ['ironarachne.normalized-mechanics.v1'],
  payload: { value: 100, attack: 50 },
};

describe('ruleset catalog', () => {
  it('publishes the closed id vocabulary and the compatibility release', () => {
    expect(RULESET_IDS).toEqual(['ironarachne', 'adnd-2e', 'dcc', 'dnd-5e']);
    expect(allRulesets()).toEqual([
      expect.objectContaining({
        ref: IRONARACHNE_RULESET_REF,
        displayName: 'Iron Arachne',
        capabilities: ['actor', 'item', 'potion', 'spell', 'hoard', 'currency'],
      }),
    ]);
  });

  it('returns defensive catalog and source copies', () => {
    const descriptors = allRulesets();
    descriptors[0].sourceIds.push('invented');
    descriptors[0].ref.release = 'changed';

    const sources = allRulesDataSources();
    sources[0].grant.notice = 'changed';

    expect(allRulesets()[0].sourceIds).toEqual(['ironarachne.normalized-mechanics.v1']);
    expect(allRulesets()[0].ref.release).toBe('1');
    expect(allRulesDataSources()[0].grant.notice).toBe(
      'Original mechanics authored for Iron Arachne.',
    );
  });

  it('compares both parts of a ref', () => {
    expect(sameRulesetRef(IRONARACHNE_RULESET_REF, { ...IRONARACHNE_RULESET_REF })).toBe(true);
    expect(
      sameRulesetRef(IRONARACHNE_RULESET_REF, { ...IRONARACHNE_RULESET_REF, release: '2' }),
    ).toBe(false);
    expect(
      sameRulesetRef(IRONARACHNE_RULESET_REF, {
        id: 'dcc',
        release: IRONARACHNE_RULESET_REF.release,
      }),
    ).toBe(false);
  });

  it('loads a known definition lazily', async () => {
    const result = await getRuleset(IRONARACHNE_RULESET_REF);
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        descriptor: expect.objectContaining({ ref: IRONARACHNE_RULESET_REF }),
      }),
    });
  });

  it('distinguishes unknown ids and releases', async () => {
    const unknownId = await getRuleset({
      id: 'newer-system',
      release: '1',
    } as unknown as RulesetRef);
    const unknownRelease = await getRuleset({ id: 'ironarachne', release: 'newer' });
    const unregisteredKnownId = await getRuleset({ id: 'dcc', release: '1' });
    const emptyRelease = await getRuleset({ id: 'ironarachne', release: '' });
    const blankRelease = await getRuleset({ id: 'ironarachne', release: '   ' });

    expect(unknownId).toMatchObject({ ok: false, reason: 'unknown-ruleset' });
    expect(unknownRelease).toMatchObject({ ok: false, reason: 'unknown-release' });
    expect(unregisteredKnownId).toMatchObject({ ok: false, reason: 'unknown-release' });
    expect(emptyRelease).toMatchObject({ ok: false, reason: 'unknown-release' });
    expect(blankRelease).toMatchObject({ ok: false, reason: 'unknown-release' });
  });
});

describe('definition integrity', () => {
  const descriptor = (capabilities: RulesetDescriptor['capabilities']): RulesetDescriptor => ({
    ref: IRONARACHNE_RULESET_REF,
    displayName: 'Test',
    capabilities,
    sourceIds: [],
  });
  const codec: MechanicsCodec = {
    schemaVersion: () => 1,
    validate: (_subject, payload) => acceptedRuleset(payload),
    migrate: (_subject, payload) => acceptedRuleset(payload),
    present: () => ({ lines: [] }),
  };
  const itemCodec: MechanicsCodec = {
    ...codec,
    schemaVersion: (subject) => (subject === 'item' ? 1 : undefined),
  };

  it('accepts an honest partial definition', () => {
    const definition = { descriptor: descriptor([]) };
    expect(defineRuleset(definition)).toBe(definition);
  });

  it('rejects duplicate capabilities', () => {
    expect(() =>
      defineRuleset({ descriptor: descriptor(['item', 'item']), mechanics: codec }),
    ).toThrow('declared more than once');
  });

  it('requires mechanics capabilities and their codec to agree', () => {
    expect(() => defineRuleset({ descriptor: descriptor(['item']) })).toThrow(
      'mechanics codec and subject capabilities do not agree',
    );
    expect(() => defineRuleset({ descriptor: descriptor([]), mechanics: codec })).toThrow(
      'mechanics codec and subject capabilities do not agree',
    );
    expect(
      defineRuleset({ descriptor: descriptor(['item']), mechanics: itemCodec }).mechanics,
    ).toBe(itemCodec);
  });

  it('requires positive integer mechanics schema versions', () => {
    const invalidCodec = { ...itemCodec, schemaVersion: () => 0 };
    expect(() =>
      defineRuleset({
        descriptor: descriptor(['actor', 'item', 'potion', 'spell', 'hoard']),
        mechanics: invalidCodec,
      }),
    ).toThrow('schema version must be a positive integer');
  });

  it('requires named services and capabilities to agree', () => {
    const currency = {
      definition: { baseDenominationId: 'coin', denominations: [] },
      format: (amount: number) => `${amount}`,
    };
    expect(() => defineRuleset({ descriptor: descriptor(['currency']) })).toThrow(
      'currency service and capability do not agree',
    );
    expect(() => defineRuleset({ descriptor: descriptor([]), currency })).toThrow(
      'currency service and capability do not agree',
    );
    expect(defineRuleset({ descriptor: descriptor(['currency']), currency }).currency).toBe(
      currency,
    );
  });
});

describe('rules data sources', () => {
  const source: RulesDataSource = {
    id: 'test.source',
    title: 'Test source',
    version: '1',
    publisher: 'Test publisher',
    grant: {
      id: 'test-grant',
      name: 'Test grant',
      scope: 'original',
      notice: 'A notice.',
    },
    attribution: 'Test author',
    redistributable: true,
  };

  it('accepts a complete redistributable source', () => {
    expect(defineRulesDataSource(source)).toBe(source);
  });

  it('rejects incomplete metadata', () => {
    expect(() => defineRulesDataSource({ ...source, title: ' ' })).toThrow(
      'metadata must not be empty',
    );
  });

  it('rejects unknown scopes and non-redistributable material', () => {
    expect(() =>
      defineRulesDataSource({
        ...source,
        grant: { ...source.grant, scope: 'unknown' },
      } as unknown as RulesDataSource),
    ).toThrow('no approved content scope');
    expect(() =>
      defineRulesDataSource({ ...source, redistributable: false } as unknown as RulesDataSource),
    ).toThrow('not approved for redistribution');
  });
});

describe('qualified mechanics', () => {
  it('validates and copies a complete envelope', () => {
    const result = validateQualifiedMechanics(genericItem);
    expect(result).toEqual({ ok: true, value: genericItem });
    if (result.ok) {
      expect(result.value).not.toBe(genericItem);
      expect(result.value.sourceIds).not.toBe(genericItem.sourceIds);
    }
  });

  it.each([
    [null, 'invalid-mechanics'],
    [{ ...genericItem, ruleset: null }, 'unknown-ruleset'],
    [{ ...genericItem, ruleset: { id: 'ironarachne' } }, 'unknown-release'],
    [{ ...genericItem, ruleset: { id: 'ironarachne', release: '2' } }, 'unknown-release'],
    [{ ...genericItem, subject: 'weapon' }, 'invalid-mechanics'],
    [{ ...genericItem, schemaVersion: 0 }, 'unsupported-version'],
    [{ ...genericItem, schemaVersion: 1.2 }, 'unsupported-version'],
    [{ ...genericItem, origin: 'converted' }, 'invalid-mechanics'],
    [{ ...genericItem, sourceIds: [1] }, 'invalid-mechanics'],
    [{ ...genericItem, sourceIds: ['missing.source'] }, 'unknown-source'],
    [
      {
        ruleset: IRONARACHNE_RULESET_REF,
        subject: 'item',
        schemaVersion: 1,
        origin: 'migrated',
        sourceIds: [],
      },
      'invalid-mechanics',
    ],
  ])('rejects malformed mechanics %#', (value, reason) => {
    expect(validateQualifiedMechanics(value)).toMatchObject({ ok: false, reason });
  });

  it('adds a new variant without mutating the set', () => {
    const original = { variants: [] };
    const result = addMechanicsVariant(original, genericItem);

    expect(result).toEqual({ ok: true, value: { variants: [genericItem] } });
    expect(original.variants).toEqual([]);
  });

  it('rejects invalid and duplicate variants', () => {
    expect(
      addMechanicsVariant({ variants: [] }, {
        ...genericItem,
        subject: 'wrong',
      } as unknown as QualifiedMechanics),
    ).toMatchObject({ ok: false, reason: 'invalid-mechanics' });
    expect(addMechanicsVariant({ variants: [genericItem] }, genericItem)).toMatchObject({
      ok: false,
      reason: 'variant-conflict',
    });
  });

  it('looks up an exact variant', () => {
    const set = { variants: [genericItem] };
    expect(mechanicsFor(set, IRONARACHNE_RULESET_REF)).toBe(genericItem);
    expect(mechanicsFor(set, { id: 'ironarachne', release: '2' })).toBeUndefined();
  });

  it('validates current compatibility mechanics through the loaded codec', async () => {
    expect(await migrateQualifiedMechanics(genericItem)).toEqual({
      ok: true,
      value: genericItem,
    });
    expect(await migrateQualifiedMechanics({ ...genericItem, schemaVersion: 0 })).toMatchObject({
      ok: false,
      reason: 'unsupported-version',
    });
    expect(await migrateQualifiedMechanics({ ...genericItem, schemaVersion: 2 })).toMatchObject({
      ok: false,
      reason: 'unsupported-version',
    });
  });
});

describe('mechanics sets', () => {
  it('validates variants and rejects duplicate refs', () => {
    expect(validateMechanicsSet({ variants: [genericItem] })).toEqual({
      ok: true,
      value: { variants: [genericItem] },
    });
    expect(validateMechanicsSet({ variants: [genericItem, genericItem] })).toMatchObject({
      ok: false,
      reason: 'variant-conflict',
    });
  });

  it('rejects a valid variant attached to the wrong kind of entity', () => {
    expect(validateMechanicsSet({ variants: [genericItem] }, 'actor')).toMatchObject({
      ok: false,
      reason: 'invalid-mechanics',
    });
  });

  it('rejects malformed and unknown variants so their artifacts can be quarantined intact', () => {
    expect(validateMechanicsSet(null)).toMatchObject({ ok: false, reason: 'invalid-mechanics' });
    expect(
      validateMechanicsSet({
        variants: [{ ...genericItem, ruleset: { id: 'future-system', release: '1' } }],
      }),
    ).toMatchObject({ ok: false, reason: 'unknown-ruleset' });
  });
});

describe('treasure derivation and notices', () => {
  const item = { id: 'sword', name: 'Sword', description: 'A sword.', weight: 1.5 };

  it('does not overwrite an existing target variant', async () => {
    const result = await deriveTreasureItemMechanics(
      IRONARACHNE_RULESET_REF,
      item,
      { variants: [genericItem] },
      {},
      new RNG('duplicate'),
    );
    expect(result).toMatchObject({ ok: false, reason: 'variant-conflict' });
  });

  it('reports an unsupported derivation capability', async () => {
    const result = await deriveTreasureItemMechanics(
      IRONARACHNE_RULESET_REF,
      item,
      { variants: [] },
      {},
      new RNG('unsupported'),
    );
    expect(result).toMatchObject({ ok: false, reason: 'unsupported-capability' });
  });

  it('deduplicates source notices in ruleset order', () => {
    const result = rulesetNotices([IRONARACHNE_RULESET_REF, IRONARACHNE_RULESET_REF]);
    expect(result).toEqual({
      ok: true,
      value: [
        expect.objectContaining({
          id: 'ironarachne.normalized-mechanics.v1',
          redistributable: true,
        }),
      ],
    });
  });

  it('refuses to omit notices for an unknown release', () => {
    expect(rulesetNotices([{ id: 'ironarachne', release: '2' }])).toMatchObject({
      ok: false,
      reason: 'unknown-release',
    });
  });
});

describe('result helpers', () => {
  it('construct successful and failed results', () => {
    expect(acceptedRuleset(3)).toEqual({ ok: true, value: 3 });
    expect(rejectedRuleset('migration-failed', 'no path')).toEqual({
      ok: false,
      reason: 'migration-failed',
      message: 'no path',
    });
  });
});
