/**
 * Writing a region for storage. Reading one back is `region_rehydrate.ts`.
 *
 * This is the most composed payload on the site, and almost none of the work is here: every part
 * of a region already had a stored form by the time this tool reached the front of the readiness
 * pass, which is the whole point of the ordering. A culture, a settlement, an organization, a
 * character and a coat of arms each convert through the library that owns the concept, and this
 * module composes them.
 *
 * **The map is stored and a picture of it is not.** `RegionMap` is a plain graph of nodes, edges
 * and corners, so it survives `structuredClone` as it stands; the SVG `region_map_svg.ts` produces
 * is a rendering, and a rendering is a fossil — it cannot be re-themed, re-rendered at another
 * size, or read by anything but the renderer that made it. That is decision 3 of
 * docs/readiness-locations.md, and the graph is smaller than the picture of it besides.
 *
 * **A referenced culture or settlement is not in this payload.** `dominantCulture` is `null` when a
 * saved culture supplied it, exactly as a culture's own `religion` is; a referenced settlement is
 * absent from `settlements`. Which artifact it is lives on the reference, per rule 2 of
 * docs/workshop.md — a region holding its own copy of a settlement somebody later edits would show
 * the stale one forever.
 *
 * **A realm's type is stored by name.** `RealmType` is a row of the table in `$lib/realms`, and an
 * embedded copy goes stale the day that row grows a field — the treatment the pass gives species
 * and archetypes, for the same reason.
 */

import { toStoredCharacter, type StoredCharacter } from '$lib/characters';
import { toCultureSnapshot, type CultureSnapshot } from '$lib/culture';
import type { Environment } from '$lib/environment';
import { toStoredArms, type StoredArms } from '$lib/heraldry';
import type { RegionMap } from '$lib/map';
import { toStoredOrganization, type StoredOrganization } from '$lib/organizations';
import type { Realm } from '$lib/realms';
import { toSettlementSnapshot, type SettlementSnapshot } from '$lib/settlements';
import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type Region from './region.js';

/** A realm as it is stored: its arms and its ruler converted, its type named. */
export type StoredRealm = Omit<Realm, 'heraldry' | 'authority' | 'realmType'> & {
  heraldry: StoredArms;
  authority: StoredCharacter;
  realmTypeName: string;
};

/** A region as it is stored. */
export type RegionSnapshot = {
  name: string;
  description: string;
  environment: Environment;
  /** `null` when a referenced culture artifact supplies it. See the header. */
  dominantCulture: CultureSnapshot | null;
  settlements: SettlementSnapshot[];
  mainRealm: number;
  realms: StoredRealm[];
  authority: StoredCharacter;
  organizations: StoredOrganization[];
  map: RegionMap;
};

function toStoredRealm(realm: Realm): StoredRealm {
  const { heraldry, authority, realmType, ...rest } = realm;
  return {
    ...rest,
    tiles: realm.tiles.map((tile) => ({ ...tile })),
    claims: realm.claims.map((claim) => ({ ...claim })),
    grantedTitle: { ...realm.grantedTitle, tags: [...realm.grantedTitle.tags] },
    heraldry: toStoredArms(heraldry),
    authority: toStoredCharacter(authority),
    realmTypeName: realmType.name,
  };
}

/**
 * What the caller supplied rather than the generator, so it is linked and not copied.
 *
 * Both are opt-in and both default to absent, which is the ordinary case: a region that generated
 * everything it holds stores everything it holds.
 */
export type RegionReferenceOptions = {
  /** True when a saved culture named this region, so the payload keeps none of its own. */
  cultureIsReferenced?: boolean;
  /** The name of the settlement a saved artifact supplied, which is left out of the payload. */
  referencedSettlementName?: string;
};

export function toRegionSnapshot(
  region: Region,
  options: RegionReferenceOptions = {},
): RegionSnapshot {
  const settlements = region.settlements.filter(
    (settlement) =>
      options.referencedSettlementName === undefined ||
      settlement.name !== options.referencedSettlementName,
  );

  const snapshot: RegionSnapshot = {
    name: region.name,
    description: region.description,
    environment: region.environment,
    dominantCulture:
      options.cultureIsReferenced === true || region.dominantCulture === null
        ? null
        : toCultureSnapshot(region.dominantCulture),
    settlements: settlements.map(toSettlementSnapshot),
    mainRealm: region.mainRealm,
    realms: region.realms.map(toStoredRealm),
    authority: toStoredCharacter(region.authority),
    organizations: region.organizations.map((organization) => toStoredOrganization(organization)),
    map: region.map,
  };

  return stripFunctionValuesDeep(snapshot) as RegionSnapshot;
}
