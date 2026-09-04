import {
  createArtifactKindRegistry,
  getArtifactKind,
  listArtifactKinds,
  readArtifactPayloadForKind,
  registerArtifactKind,
  type AnyArtifactKindEntry,
  type ArtifactKind,
  type ArtifactKindRegistry,
  type PayloadResult,
} from '$lib/artifact_kinds';
// Deep on purpose, and measured against the bundle: these libraries' entry points reach a
// generator and from there the species tables. Assembling this registry through
// them costs 296 KB in the chunk that imports it; through the kind modules it costs 4 KB.
// Everything in the workshop touches this registry, so that difference is paid by any page that
// so much as lists what a project contains. Settlement is the sharpest case of the four: its entry
// point reaches `$lib/organizations`, and from there the heraldry generator and the charge library.
import { adndCharacterArtifactKind } from '$lib/adnd/adnd_character_artifact_kind';
import { characterArtifactKind } from '$lib/characters/character_artifact_kind';
import { armsManufacturerArtifactKind } from '$lib/arms_manufacturer/arms_manufacturer_artifact_kind';
import { organizationArtifactKind } from '$lib/organizations/organization_artifact_kind';
import { starNationArtifactKind } from '$lib/civilizations/star_nation_artifact_kind';
// Through the entry point, unlike its neighbours: `$lib/chopshop` is a few kilobytes of prose and
// nothing heavier, so there is no measurement that would justify a deep import.
import { chopShopArtifactKind } from '$lib/chopshop';
// Through the entry point, like the chop shop beside it and for the same reason — and measured
// rather than assumed: `$lib/spooky_ship` is four phrase tables, so the registry chunk and
// everything it statically imports is 431 KB across 43 chunks through the entry point and 429 KB
// across 41 through the kind module. Two kilobytes is not a deep import; an allowlist entry with
// nothing behind it is how that rule rots.
import { spookyShipArtifactKind } from '$lib/spooky_ship';
import { familyArtifactKind } from '$lib/families/family_artifact_kind';
import { encounterArtifactKind } from '$lib/encounters/encounter_artifact_kind';
import { cultureArtifactKind } from '$lib/culture/culture_artifact_kind';
import { dccCharacterArtifactKind } from '$lib/dcc/dcc_character_artifact_kind';
import { dungeonArtifactKind } from '$lib/dungeon/dungeon_artifact_kind';
// Through the entry point, unlike most of its neighbours, and measured rather than assumed: this
// library is tables of numbers and five small sub-generators, so the registry chunk is the same
// 136.1 KB across 17 chunks either way. See the note in `library_imports.test.ts`.
import { environmentArtifactKind } from '$lib/environment';
import { planetArtifactKind } from '$lib/astronomical_bodies/planet_artifact_kind';
import { starSystemArtifactKind } from '$lib/astronomical_bodies/star_system_artifact_kind';
import { regionArtifactKind } from '$lib/regions/region_artifact_kind';
// Through the entry point: `$lib/drug` is two phrase tables and a generator, with no species list
// or image behind it. Measured the way the entries in `library_imports.test.ts` were.
import { drugArtifactKind } from '$lib/drug';
// Deep, and measured the way its neighbours were: `$lib/equipment`'s entry point reaches the
// generator and from there the weapon, armour, material, refinement, enchantment and decoration
// tables, the made-up-names package, and the whole twenty-three-list fantasy price list. Through
// the kind module the registry chunk and everything it statically imports is 292 KB across 31
// chunks; through the entry point it is 408 KB across 35. Every page that lists what a project
// contains pays that difference.
import { itemArtifactKind } from '$lib/equipment/item_artifact_kind';
// Deep, and the sharpest of the lot: `$lib/merchants`'s entry point reaches `generate_merchant`,
// and from there the character generator, the species tables and — through the merchant mark —
// the whole charge library. Measured on the build: through the kind module the registry chunk and
// everything it statically imports is 296 KB across 31 chunks; through the entry point it is
// 19.7 MB across 47.
import { merchantArtifactKind } from '$lib/merchants/merchant_artifact_kind';
// Deep, and measured the way its neighbours were: `$lib/potions`'s entry point reaches the
// generator, and from there the whole potion catalog, the sensory tables and `$lib/equipment`'s
// container generator. Through the kind module the registry chunk and everything it statically
// imports is 304 KB across 32 chunks; through the entry point it is 445 KB across 36.
import { potionArtifactKind } from '$lib/potions/potion_artifact_kind';
// Deep, and measured the way its neighbours were: `$lib/treasure`'s entry point reaches the hoard
// generator, and from there the item, container, gem, art-object and potion generators. Through the
// kind module the registry chunk and everything it statically imports is 426 KB across 40 chunks;
// through the entry point it is 477 KB across 43.
import { treasureHoardArtifactKind } from '$lib/treasure/treasure_hoard_artifact_kind';
import { heraldryArtifactKind } from '$lib/heraldry/heraldry_artifact_kind';
// Deep, and measured the way its neighbours were: `$lib/languages`'s entry point reaches the
// lexicon's eleven word-bucket lists and the themed-noun table, plus the whole English↔conlang
// translation layer. Through the kind module the registry chunk and everything it statically
// imports is 429.5 KB across 45 chunks; through the entry point it is 474.5 KB across 47. Forty-five
// kilobytes is the same band that bought `$lib/treasure` its entry, and well clear of the two that
// did not buy `$lib/spooky_ship` one.
import { languageArtifactKind } from '$lib/languages/language_artifact_kind';
import { religionArtifactKind } from '$lib/religion/religion_artifact_kind';
import { settlementArtifactKind } from '$lib/settlements/settlement_artifact_kind';
import { swnCharacterArtifactKind } from '$lib/swn/swn_character_artifact_kind';
// Deep, for the same reason its character sibling is: `$lib/swn`'s entry point carries the
// character PDF renderer, which reaches `$lib/characters` and from there the whole species table.
import { swnStarshipArtifactKind } from '$lib/swn/swn_starship_artifact_kind';
import { uwCharacterArtifactKind } from '$lib/unchartedworlds/uw_character_artifact_kind';
import { velgarthGiftsArtifactKind } from '$lib/velgarth_gifts/velgarth_gifts_artifact_kind';

/**
 * Assembled statically, in a single list, exactly like `TOOL_PANELS` beside it and the tool
 * catalog it mirrors. Self-registration on import was the alternative and it is worse: a kind
 * would exist only once something happened to load its library, so whether an import could read
 * a culture would depend on which page the user was on when they started it.
 *
 * Adding a kind is one line here and an `defineArtifactKind` entry in the owning library. No
 * generic code — the store, export, the project view — changes to accommodate it.
 */
function buildArtifactKindRegistry(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, heraldryArtifactKind);
  registerArtifactKind(registry, cultureArtifactKind);
  registerArtifactKind(registry, religionArtifactKind);
  registerArtifactKind(registry, settlementArtifactKind);
  registerArtifactKind(registry, adndCharacterArtifactKind);
  registerArtifactKind(registry, characterArtifactKind);
  registerArtifactKind(registry, dccCharacterArtifactKind);
  registerArtifactKind(registry, swnCharacterArtifactKind);
  registerArtifactKind(registry, uwCharacterArtifactKind);
  registerArtifactKind(registry, velgarthGiftsArtifactKind);
  registerArtifactKind(registry, armsManufacturerArtifactKind);
  registerArtifactKind(registry, encounterArtifactKind);
  registerArtifactKind(registry, familyArtifactKind);
  registerArtifactKind(registry, organizationArtifactKind);
  registerArtifactKind(registry, starNationArtifactKind);
  registerArtifactKind(registry, chopShopArtifactKind);
  registerArtifactKind(registry, dungeonArtifactKind);
  registerArtifactKind(registry, environmentArtifactKind);
  registerArtifactKind(registry, planetArtifactKind);
  registerArtifactKind(registry, starSystemArtifactKind);
  registerArtifactKind(registry, regionArtifactKind);
  registerArtifactKind(registry, drugArtifactKind);
  registerArtifactKind(registry, itemArtifactKind);
  registerArtifactKind(registry, merchantArtifactKind);
  registerArtifactKind(registry, potionArtifactKind);
  registerArtifactKind(registry, treasureHoardArtifactKind);
  registerArtifactKind(registry, spookyShipArtifactKind);
  registerArtifactKind(registry, swnStarshipArtifactKind);
  registerArtifactKind(registry, languageArtifactKind);
  return registry;
}

/** Every artifact kind this build understands. */
export const ARTIFACT_KINDS: ArtifactKindRegistry = buildArtifactKindRegistry();

/** The entry for a kind, or undefined when this build does not have it. */
export function artifactKindEntry(kind: ArtifactKind): AnyArtifactKindEntry | undefined {
  return getArtifactKind(ARTIFACT_KINDS, kind);
}

/** Every registered kind, in registration order. */
export function registeredArtifactKinds(): AnyArtifactKindEntry[] {
  return listArtifactKinds(ARTIFACT_KINDS);
}

/**
 * Reads a stored payload whose kind and version come from the data itself — what storage and
 * import both hand over. Unknown kinds, unreadable versions, and failed migrations all come back
 * as a rejection carrying its reason, so one bad record costs that record alone.
 */
export function readRegisteredArtifactPayload(
  kind: ArtifactKind,
  payload: unknown,
  fromVersion: number,
): PayloadResult<unknown> {
  return readArtifactPayloadForKind(ARTIFACT_KINDS, kind, payload, fromVersion);
}
