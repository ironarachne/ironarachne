/**
 * Rebuilding a settlement from a snapshot, kept apart from `settlement_snapshot.ts` because of
 * what it costs. Restoring an organization's emblem resolves charge names against
 * `$lib/charges` — 18 MB of glyph art, measured — and restoring a character's archetype reaches
 * the fantasy archetype tables. Writing a snapshot needs neither, and the kind registry validates
 * one without touching either module, so the two directions do not belong in the same file.
 */

import { getAllFantasyArchetypes, type Archetype } from '$lib/archetypes';
import type { Character } from '$lib/characters';
import { armsFromStored } from '$lib/heraldry';
import type { OrganizationHierarchy, Organization } from '$lib/organizations';
import type { VisualIdentity } from '$lib/visual_identity';

import type {
  SettlementSnapshot,
  StoredArchetype,
  StoredCharacter,
  StoredOrganization,
  StoredOrganizationHierarchy,
  StoredSettlementNotable,
  StoredVisualIdentity,
} from './settlement_snapshot.js';
import type { Settlement, SettlementImportantPerson } from './settlement_types.js';

/**
 * The equipment tables each archetype was rolled from, by archetype name.
 *
 * Built once. `getAllFantasyArchetypes` returns a shared array that must not be mutated, and this
 * only ever reads from it.
 */
const equipmentConfigsByArchetypeName = new Map(
  getAllFantasyArchetypes().map((archetype) => [
    archetype.name,
    archetype.equipmentGenerationConfigs,
  ]),
);

/**
 * An archetype with its equipment tables put back.
 *
 * An archetype this build no longer has comes back with no tables rather than throwing. That is
 * requirement 3.3 applied one level down: the tables are what a character would be *re-equipped*
 * from, which a saved settlement never does, so a settlement whose blacksmith archetype was
 * renamed in some later release is still every bit the settlement the user saved.
 */
function archetypeFromStored(stored: StoredArchetype): Archetype {
  return {
    ...stored,
    equipmentGenerationConfigs: equipmentConfigsByArchetypeName.get(stored.name) ?? [],
  };
}

function characterFromStored(stored: StoredCharacter): Character {
  const { archetype, heraldry, ...rest } = stored;
  return {
    ...rest,
    ...(archetype === undefined ? {} : { archetype: archetypeFromStored(archetype) }),
    ...(heraldry === undefined ? {} : { heraldry: armsFromStored(heraldry) }),
  };
}

function notableFromStored(stored: StoredSettlementNotable): SettlementImportantPerson {
  return { ...stored, character: characterFromStored(stored.character) };
}

function hierarchyFromStored(stored: StoredOrganizationHierarchy): OrganizationHierarchy {
  return {
    childToParent: new Map(stored.childToParent),
    idToOrder: new Map(stored.idToOrder),
    roleById: new Map(stored.roleById),
  };
}

function visualIdentityFromStored(stored: StoredVisualIdentity): VisualIdentity {
  const { emblem } = stored;
  return {
    ...stored,
    emblem:
      emblem.kind === 'heraldry' ? { kind: 'heraldry', arms: armsFromStored(emblem.arms) } : emblem,
  };
}

function organizationFromStored(stored: StoredOrganization): Organization {
  return {
    ...stored,
    hierarchy: hierarchyFromStored(stored.hierarchy),
    leader: characterFromStored(stored.leader),
    notableMembers: stored.notableMembers.map(characterFromStored),
    visualIdentity: visualIdentityFromStored(stored.visualIdentity),
  };
}

/**
 * A stored settlement, live again.
 *
 * It takes no RNG and generates nothing: the payload is the truth (docs/workshop.md), and every
 * value here is either what was stored or a lookup from a name that was stored. The kind's codec
 * is handed an RNG all the same, because the contract gives every codec one; this one ignores it.
 */
export function settlementFromSnapshot(snapshot: SettlementSnapshot): Settlement {
  const { importantPeople, organizations, ...rest } = snapshot;
  return {
    ...rest,
    ...(importantPeople === undefined
      ? {}
      : { importantPeople: importantPeople.map(notableFromStored) }),
    ...(organizations === undefined
      ? {}
      : { organizations: organizations.map(organizationFromStored) }),
  };
}
