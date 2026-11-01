import { describe, expect, it, vi } from 'vitest';
import * as reading from './organization_reading';
import { RNG } from '@ironarachne/rng';
import {
  buildOrganizationProfile,
  composeOrganizationDescription,
  organizationReadingSubject,
  resolveEnvironmentNarrative,
} from './organization_profile';
import { composeOrganizationReading } from './organization_reading';
import { rollOrganizationSnapshot } from './organization_roll';
import {
  organizationToMarkdown,
  organizationToText,
  organizationSummaryLine,
} from './organization_presentation';
import { setOrganizationFacetLabel, setOrganizationText } from './organization_editing';
import { generate as generateEnvironment, getDefaultConfig } from '$lib/environment';

const kinds = [
  'mercenary_company',
  'trading_company',
  'weavers_collective',
  'signet_circle',
  'wizard_school',
  'holy_order',
  'druid_circle',
  'noble_house',
  'thieves_guild',
  'corporate_division',
  'colonial_syndicate',
  'research_institute',
  'smuggler_outfit',
  'sf_mercenary_outfit',
  'starship_squadron',
  'unknown',
];

describe('supported organization reading', () => {
  it('exercises every archetype with explicit subjects independent of the proper name', () => {
    let archetypes = 0;
    for (const kind of kinds) {
      const hooks = new Set<string>();
      for (let seed = 0; seed < 100; seed++) {
        const profile = buildOrganizationProfile(
          new RNG(`${seed}`),
          kind,
          'Sisters of the Company',
          { genre: 'fantasy' },
        );
        hooks.add(profile.hook);
        const subject = organizationReadingSubject('group', kind, profile);
        expect(new Set(subject.candidates.map((candidate) => candidate.id)).size).toBe(
          subject.candidates.length,
        );
        for (const candidate of subject.candidates)
          for (const template of candidate.templates)
            for (const part of template.parts)
              for (const text of part.options) {
                expect(text).toMatch(/[.!?]$/);
                expect(text).not.toMatch(
                  /Sisters of the Company|aim at|Their most telling liability|analyzed in taverns|Public standing:/,
                );
              }
        const result = composeOrganizationReading(subject, new RNG('reading'));
        expect(result.selections).toHaveLength(2);
        expect(result.text).not.toContain('Sisters of the Company');
        expect(composeOrganizationDescription(12, profile)).not.toBe('');
        expect(profile).toEqual(
          buildOrganizationProfile(new RNG(`${seed}`), kind, 'The Silver Circle', {
            genre: 'fantasy',
          }),
        );
      }
      archetypes += hooks.size;
    }
    expect(archetypes).toBe(61);
  });

  it('isolates wording draws from names, leaders, members, emblems and stable identities', () => {
    const before = rollOrganizationSnapshot('450-wording-isolation', {
      kindId: 'holy_order',
      genre: 'fantasy',
    });
    const compose = reading.composeOrganizationReading;
    const spy = vi
      .spyOn(reading, 'composeOrganizationReading')
      .mockImplementation((subject, rng, context) => {
        for (let index = 0; index < 100; index++) rng.int(0, 1000);
        return compose(subject, rng, context);
      });
    try {
      const after = rollOrganizationSnapshot('450-wording-isolation', {
        kindId: 'holy_order',
        genre: 'fantasy',
      });
      expect({ ...after, description: '' }).toEqual({ ...before, description: '' });
    } finally {
      spy.mockRestore();
    }
  });

  it('does not paraphrase edited or custom facets from a recognized ID', () => {
    const profile = buildOrganizationProfile(new RNG('450'), 'holy_order', 'Sisters', {
      genre: 'fantasy',
    });
    const original = structuredClone(profile);
    const edited = {
      ...profile,
      goal: { ...profile.goal, label: 'An authored aim.' },
      weakness: { id: 'custom', label: 'Custom weakness.' },
      hook: '',
    };
    expect(organizationReadingSubject('group', 'holy_order', edited).candidates).toEqual([]);
    expect(composeOrganizationDescription(10, edited)).toBe('');
    profile.goal.label = 'A mutated live profile';
    expect(
      buildOrganizationProfile(new RNG('450'), 'holy_order', 'Sisters', { genre: 'fantasy' }),
    ).toEqual(original);
    expect(composeOrganizationReading({ id: 'empty', candidates: [] }, new RNG('empty')).text).toBe(
      '',
    );
  });

  it('is reproducible, varies safe wording and carries explicit batch context', () => {
    const profile = buildOrganizationProfile(new RNG('450'), 'holy_order', 'Sisters', {
      genre: 'fantasy',
    });
    const subject = organizationReadingSubject('group', 'holy_order', profile);
    const first = composeOrganizationReading(subject, new RNG('first'));
    expect(first).toEqual(composeOrganizationReading(subject, new RNG('first')));
    const next = composeOrganizationReading(subject, new RNG('first'), first.nextContext);
    expect(next.text).not.toBe(first.text);
    expect(next.nextContext.recentSelections).toHaveLength(4);
    expect(
      new Set(
        Array.from(
          { length: 20 },
          (_, seed) => composeOrganizationReading(subject, new RNG(`${seed}`)).text,
        ),
      ).size,
    ).toBeGreaterThan(1);
  });

  it('omits biome-derived transport and disease claims while retaining explicit contexts', () => {
    const environment = generateEnvironment(getDefaultConfig(new RNG('450-environment')));
    for (const name of [
      'temperate deciduous forest',
      'tropical rainforest',
      'cold desert',
      'subtropical desert',
      'montane forest',
      'tundra',
      'freshwater lake',
    ]) {
      environment.biome = { ...environment.biome, name };
      for (const genre of ['fantasy', 'science_fiction'] as const)
        expect(
          resolveEnvironmentNarrative(genre, 'holy_order', undefined, environment),
        ).toBeUndefined();
    }
    expect(
      resolveEnvironmentNarrative(
        'fantasy',
        '',
        { kind: 'hint', text: '  A caller-written context.  ' },
        environment,
      ),
    ).toEqual({ id: 'hint', shortLabel: 'A caller-written context.' });
    expect(
      resolveEnvironmentNarrative('fantasy', '', { kind: 'hint', text: ' ' }, environment),
    ).toBeUndefined();
    expect(resolveEnvironmentNarrative('fantasy', '', undefined, undefined)).toBeUndefined();
    for (const preset of [
      'desert_route',
      'coastal',
      'mountain_pass',
      'river_trade',
      'tundra',
      'jungle_march',
      'void_ledger',
      'rim_wilderness',
      'dome_sprawl',
    ] as const)
      expect(
        resolveEnvironmentNarrative('fantasy', '', { kind: 'preset', preset }, environment)?.id,
      ).toBe(preset);
  });

  it('keeps authored descriptions and blanks through exports and independent profile editing', () => {
    const snapshot = rollOrganizationSnapshot('450-author', {
      kindId: 'holy_order',
      genre: 'fantasy',
    });
    for (const description of [
      'An authored account. A second sentence. And a third. A fourth.',
      '',
    ]) {
      const edited = setOrganizationFacetLabel(
        setOrganizationText(snapshot, 'description', description),
        'goal',
        'New authored goal',
      );
      expect(edited.description).toBe(description);
      const markdown = organizationToMarkdown(edited);
      expect(markdown).toContain(organizationSummaryLine(edited));
      if (description) {
        expect(markdown).toContain(description);
        expect(organizationToText(edited)).toContain(description);
      } else expect(markdown).not.toContain(snapshot.description);
      expect(markdown).not.toContain('New authored goal');
      expect(organizationToMarkdown(edited, true)).toContain('New authored goal');
    }
    expect(
      organizationSummaryLine({
        ...snapshot,
        memberCount: 1,
        leader: { ...snapshot.leader, firstName: '', lastName: '' },
      }),
    ).toBe('holy order · 1 member');
    expect(organizationSummaryLine({ ...snapshot, memberCount: NaN })).not.toContain('NaN');
  });
});
