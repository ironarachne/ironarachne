import { describe, expect, it } from 'vitest';

import { RNG } from '@ironarachne/rng';

import { organizationFromSnapshot, organizationFromStored } from './organization_rehydrate.js';
import { rollOrganization } from './organization_roll.js';
import { toOrganizationSnapshot, toStoredOrganization } from './organization_snapshot.js';

/** One organization per emblem style, so imagery of every kind round-trips as parameters. */
const byStyle = {
  heraldry: rollOrganization('snapshot-heraldry', { genre: 'fantasy', kindId: 'noble_house' }),
  merchant_mark: rollOrganization('snapshot-mark', { genre: 'fantasy', kindId: 'trading_company' }),
  pattern_lattice: rollOrganization('snapshot-lattice', {
    genre: 'fantasy',
    kindId: 'weavers_collective',
  }),
  disc_emblem: rollOrganization('snapshot-disc', { genre: 'fantasy', kindId: 'signet_circle' }),
};

describe('the organization snapshot', () => {
  it('has a fixture per emblem style', () => {
    for (const [style, roll] of Object.entries(byStyle)) {
      expect(roll.organization.visualIdentity.emblem.kind, style).toBe(style);
    }
  });

  /** Requirement 7.2: lossless for everything the page shows, whichever emblem it carries. */
  for (const [style, roll] of Object.entries(byStyle)) {
    it(`round-trips an organization with a ${style} emblem`, () => {
      const restored = organizationFromSnapshot(
        toOrganizationSnapshot(roll.organization),
        new RNG('unused'),
      );

      expect(restored).toEqual(roll.organization);
    });
  }

  /** The three maps that `JSON.stringify` would silently empty. */
  it('stores the hierarchy as entry arrays and rebuilds the maps', () => {
    const { organization } = byStyle.heraldry;
    const snapshot = toOrganizationSnapshot(organization);
    const rebuilt = organizationFromStored(snapshot).hierarchy;

    expect(Array.isArray(snapshot.hierarchy.childToParent)).toBe(true);
    expect(snapshot.hierarchy.roleById.length).toBe(organization.hierarchy.roleById.size);
    expect(rebuilt.idToOrder).toEqual(organization.hierarchy.idToOrder);
    expect(rebuilt.roleById.get('lord')?.roleName).toBe('House lord');
  });

  it('stores imagery as parameters, never as a rendered SVG', () => {
    const snapshot = toOrganizationSnapshot(byStyle.merchant_mark.organization);
    const emblem = snapshot.visualIdentity.emblem;

    expect(emblem.kind).toBe('merchant_mark');
    expect(JSON.stringify(snapshot)).not.toContain('<svg');
    expect(emblem.kind === 'merchant_mark' && typeof emblem.mark.chargeName).toBe('string');
  });

  it('stores arms by their parts, and rebuilds them with their renderers', () => {
    const snapshot = toOrganizationSnapshot(byStyle.heraldry.organization);
    const emblem = snapshot.visualIdentity.emblem;

    expect(emblem.kind === 'heraldry' && emblem.arms !== null && typeof emblem.arms.blazon).toBe(
      'string',
    );
    const restored = organizationFromStored(snapshot).visualIdentity.emblem;
    expect(restored.kind).toBe('heraldry');
  });

  /** Referenced arms: `null` in the payload, no emblem on the way back, and the null kept. */
  it('writes null for referenced arms and reads it back as no emblem of its own', () => {
    const snapshot = toOrganizationSnapshot(byStyle.heraldry.organization, true);
    const emblem = snapshot.visualIdentity.emblem;

    expect(emblem).toEqual({ kind: 'heraldry', arms: null });
    const restored = organizationFromStored(snapshot);
    expect(restored.visualIdentity.emblem).toEqual({ kind: 'none' });
    expect(
      toStoredOrganization(byStyle.merchant_mark.organization, true).visualIdentity.emblem.kind,
    ).toBe('merchant_mark');
  });

  it('stores people with their species by name', () => {
    const snapshot = toOrganizationSnapshot(byStyle.heraldry.organization);

    expect(typeof snapshot.leader.speciesName).toBe('string');
    expect('species' in snapshot.leader).toBe(false);
    expect(snapshot.notableMembers.every((m) => typeof m.speciesName === 'string')).toBe(true);
  });

  it('keeps kindId as a string and never the kind itself', () => {
    const snapshot = toOrganizationSnapshot(byStyle.heraldry.organization);

    expect(snapshot.kindId).toBe('noble_house');
    expect('generateName' in snapshot).toBe(false);
  });

  it('is free of the functions IndexedDB refuses', () => {
    for (const roll of Object.values(byStyle)) {
      expect(() => structuredClone(toOrganizationSnapshot(roll.organization))).not.toThrow();
    }
  });

  it('keeps a description a user has changed rather than recomputing it', () => {
    const edited = toOrganizationSnapshot(byStyle.heraldry.organization);
    edited.description = 'They keep bees.';

    expect(organizationFromStored(edited).description).toBe('They keep bees.');
  });

  it('does not hand out the lists it was given', () => {
    const { organization } = byStyle.heraldry;
    const snapshot = toOrganizationSnapshot(organization);
    snapshot.hierarchy.idToOrder.pop();
    snapshot.notableMembers.pop();

    expect(organization.hierarchy.idToOrder.size).toBe(snapshot.hierarchy.idToOrder.length + 1);
    expect(organization.notableMembers.length).toBe(snapshot.notableMembers.length + 1);
  });
});
