import { describe, expect, it } from 'vitest';

import { religionFromSnapshot } from './religion_snapshot';
import { religionDomainNames } from './religion_domains';
import { rollReligionSnapshot } from './religion_roll';
import type { Religion } from './religion_types';

/**
 * A rolled religion, read back into the live shape the domain reader takes.
 *
 * `religionFromSnapshot` returns a `RestoredReligion` — the religion plus the seed and the options
 * it was rolled with — so the religion itself is one field in.
 */
function rolled(seed: string): Religion {
  return religionFromSnapshot(rollReligionSnapshot(seed)).religion;
}

describe('religionDomainNames', () => {
  it('names every domain a religion pantheon claims, deduplicated and sorted', () => {
    const religion = rolled('domains-seed');
    const names = religionDomainNames(religion);

    // `pantheon` is `Pantheon | null` on the live type and may be absent altogether on a restored
    // one, which is why the reader uses optional chaining rather than a null check.
    if ((religion.pantheon?.members.length ?? 0) > 0) {
      expect(names.length).toBeGreaterThan(0);
      expect([...new Set(names)]).toEqual(names);
      expect([...names].sort()).toEqual(names);
    }
  });

  it('names only domains its own gods hold', () => {
    const religion = rolled('narrow-seed');
    const held = new Set(
      (religion.pantheon?.members ?? []).flatMap((deity) =>
        [deity.domains.primary, deity.domains.secondary, deity.domains.tertiary]
          .filter((domain) => domain !== null)
          .map((domain) => domain.name),
      ),
    );

    for (const name of religionDomainNames(religion)) {
      expect(held.has(name), name).toBe(true);
    }
  });

  it('yields nothing for a tradition with no gods', () => {
    // A weapon cannot be consecrated to a god a religion does not have; the caller falls back to
    // offering every domain rather than an empty select.
    const godless = { pantheon: null } as unknown as Religion;

    expect(religionDomainNames(godless)).toEqual([]);
  });

  it('skips a deity whose domain slots are empty', () => {
    const sparse = {
      pantheon: {
        members: [{ domains: { primary: null, secondary: null, tertiary: null } }],
      },
    } as unknown as Religion;

    expect(religionDomainNames(sparse)).toEqual([]);
  });
});
