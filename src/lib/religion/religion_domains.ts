/**
 * The domains a religion's gods actually claim.
 *
 * Written for #69, which consecrates a magic weapon to a saved religion: a weapon themed on a
 * domain no god in that religion holds is not a weapon of that religion, so the tool narrows its
 * theme list to this rather than annotating the full fifty-eight.
 *
 * A religion with no pantheon — the non-theistic categories generate one — yields nothing, and the
 * caller falls back to offering every domain. That is the honest answer rather than an empty
 * select: a tradition with no gods has no gods to consecrate to.
 */

import type { Religion } from './religion_types.js';

/** Every domain named by any deity of a religion's pantheon, deduplicated and sorted. */
export function religionDomainNames(religion: Religion): string[] {
  const names = new Set<string>();

  for (const deity of religion.pantheon?.members ?? []) {
    for (const domain of [deity.domains.primary, deity.domains.secondary, deity.domains.tertiary]) {
      if (domain !== null && domain.name !== '') {
        names.add(domain.name);
      }
    }
  }

  return [...names].sort();
}
