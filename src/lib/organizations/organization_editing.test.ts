import { describe, expect, it } from 'vitest';

import {
  addOrganizationTrait,
  removeOrganizationNotable,
  removeOrganizationTrait,
  setOrganizationColor,
  setOrganizationFacetLabel,
  setOrganizationHook,
  setOrganizationMotto,
  setOrganizationPersonField,
  setOrganizationText,
  setOrganizationTraitLabel,
} from './organization_editing.js';
import { rollOrganizationSnapshot } from './organization_roll.js';

const organization = rollOrganizationSnapshot('editing-fixture', {
  genre: 'fantasy',
  kindId: 'noble_house',
});

describe('editing an organization', () => {
  it('has a fixture worth testing', () => {
    expect(organization.notableMembers.length).toBeGreaterThan(1);
    expect(organization.profile.personalityTraits.length).toBeGreaterThan(1);
  });

  it('renames the organization and leaves everything else alone', () => {
    const edited = setOrganizationText(organization, 'name', 'The Ashford Compact');

    expect(edited.name).toBe('The Ashford Compact');
    expect(edited.description).toBe(organization.description);
    expect(edited.leader).toEqual(organization.leader);
  });

  /** 4.2: the paragraph was composed from the profile at roll time; editing one does not rewrite the other. */
  it('changes a facet label without rewriting the description', () => {
    const edited = setOrganizationFacetLabel(organization, 'goal', 'to own every mill');

    expect(edited.profile.goal.label).toBe('to own every mill');
    expect(edited.profile.goal.id).toBe(organization.profile.goal.id);
    expect(edited.description).toBe(organization.description);
    expect(edited.profile.weakness).toEqual(organization.profile.weakness);
  });

  it('edits the hook and the description as the user’s prose', () => {
    const edited = setOrganizationHook(
      setOrganizationText(organization, 'description', 'They keep bees.'),
      'A hive is missing.',
    );

    expect(edited.description).toBe('They keep bees.');
    expect(edited.profile.hook).toBe('A hive is missing.');
  });

  it('sets, adds and removes traits one at a time', () => {
    const relabelled = setOrganizationTraitLabel(organization, 0, 'stubborn');
    expect(relabelled.profile.personalityTraits[0].label).toBe('stubborn');
    expect(relabelled.profile.personalityTraits.slice(1)).toEqual(
      organization.profile.personalityTraits.slice(1),
    );

    const added = addOrganizationTrait(organization);
    expect(added.profile.personalityTraits).toHaveLength(
      organization.profile.personalityTraits.length + 1,
    );
    expect(added.profile.personalityTraits.at(-1)).toEqual({ id: 'custom', label: '' });

    const removed = removeOrganizationTrait(organization, 0);
    expect(removed.profile.personalityTraits).toEqual(
      organization.profile.personalityTraits.slice(1),
    );
  });

  it('sets a motto, and removes it when emptied', () => {
    const withMotto = setOrganizationMotto(organization, 'Ever upward');
    expect(withMotto.visualIdentity.motto).toBe('Ever upward');
    expect(withMotto.visualIdentity.emblem).toEqual(organization.visualIdentity.emblem);

    const cleared = setOrganizationMotto(withMotto, '  ');
    expect('motto' in cleared.visualIdentity).toBe(false);
  });

  it('sets palette colours one slot at a time, and drops the palette with its primary', () => {
    const primary = setOrganizationColor(organization, 'primary', '#123456');
    expect(primary.visualIdentity.colors?.primary).toBe('#123456');

    const accent = setOrganizationColor(primary, 'accent', '#abcdef');
    expect(accent.visualIdentity.colors).toEqual({
      ...primary.visualIdentity.colors,
      accent: '#abcdef',
    });

    const noAccent = setOrganizationColor(accent, 'accent', '');
    expect('accent' in (noAccent.visualIdentity.colors ?? {})).toBe(false);

    const none = setOrganizationColor(accent, 'primary', '');
    expect('colors' in none.visualIdentity).toBe(false);
  });

  /** No kind sets a palette today, so this is the state every rolled organization arrives in. */
  it('does not invent a palette when an accent is cleared on an organization without one', () => {
    expect('colors' in organization.visualIdentity).toBe(false);
    const cleared = setOrganizationColor(organization, 'accent', '');
    expect(cleared).toEqual(organization);
    const typedThenCleared = setOrganizationColor(
      setOrganizationColor(organization, 'accent', 'gold'),
      'accent',
      '',
    );
    expect('colors' in typedThenCleared.visualIdentity).toBe(false);
  });

  it('renames the leader and keeps the display name in step', () => {
    const edited = setOrganizationPersonField(organization, 'leader', 'firstName', 'Tam');

    expect(edited.leader.firstName).toBe('Tam');
    expect(edited.leader.name).toBe(`Tam ${organization.leader.lastName}`);
    expect(edited.leader.description).toBe(organization.leader.description);
    expect(edited.notableMembers).toEqual(organization.notableMembers);
  });

  it('edits one notable and leaves the others alone', () => {
    const edited = setOrganizationPersonField(organization, 1, 'description', 'Keeps the ledgers.');

    expect(edited.notableMembers[1].description).toBe('Keeps the ledgers.');
    expect(edited.notableMembers[1].name).toBe(organization.notableMembers[1].name);
    expect(edited.notableMembers[0]).toEqual(organization.notableMembers[0]);
    expect(edited.leader).toEqual(organization.leader);
  });

  it('removes a notable and leaves the rest in order', () => {
    const removed = removeOrganizationNotable(organization, 0);

    expect(removed.notableMembers).toEqual(organization.notableMembers.slice(1));
    expect(removed.leader).toEqual(organization.leader);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(organization);
    setOrganizationText(organization, 'name', 'x');
    setOrganizationMotto(organization, 'x');
    setOrganizationColor(organization, 'primary', '#000');
    setOrganizationHook(organization, 'x');
    setOrganizationFacetLabel(organization, 'goal', 'x');
    setOrganizationTraitLabel(organization, 0, 'x');
    addOrganizationTrait(organization);
    removeOrganizationTrait(organization, 0);
    setOrganizationPersonField(organization, 'leader', 'lastName', 'x');
    setOrganizationPersonField(organization, 0, 'firstName', 'x');
    removeOrganizationNotable(organization, 0);

    expect(organization).toEqual(before);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setOrganizationTraitLabel(organization, 99, 'x')).toBe(organization);
    expect(removeOrganizationTrait(organization, -1)).toBe(organization);
    expect(setOrganizationPersonField(organization, 99, 'firstName', 'x')).toBe(organization);
    expect(setOrganizationPersonField(organization, 0.5, 'firstName', 'x')).toBe(organization);
    expect(removeOrganizationNotable(organization, 99)).toBe(organization);
  });
});
