/**
 * Rebuilding a character from a snapshot, kept apart from `character_snapshot.ts` because of what
 * it costs. Restoring an archetype's equipment tables reaches `$lib/archetypes`, restoring a
 * species reaches `$lib/species_sentients`, and restoring a coat of arms resolves charge names
 * against `$lib/charges` — 18 MB of glyph art, measured. Writing a snapshot needs none of them, and
 * the kind registry validates one without touching any, so the two directions do not belong in the
 * same file.
 *
 * **Nothing here is recomputed.** Height, weight, the description prose, the personality traits,
 * the land a title is named for: all of it comes back exactly as it was stored, per requirement 4.2
 * in docs/workshop.md. Species and archetype are resolved by name only so the sheet can say what
 * they were.
 */

import { getAllFantasyArchetypes, type Archetype } from '$lib/archetypes';
import { armsFromStored } from '$lib/heraldry';
import type { Species } from '$lib/species';
import { sentientSpeciesList } from '$lib/species_sentients';

import type { CharacterSnapshot, StoredArchetype, StoredCharacter } from './character_snapshot.js';
import type { Character } from './character_types.js';

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
 * from, which reading a saved character never does, so a character whose blacksmith archetype was
 * renamed in some later release is still every bit the character the user saved.
 */
export function archetypeFromStored(stored: StoredArchetype): Archetype {
  return {
    ...stored,
    equipmentGenerationConfigs: equipmentConfigsByArchetypeName.get(stored.name) ?? [],
  };
}

/**
 * A species this build does not have, carrying nothing but the name it was stored under.
 *
 * The point of it is that it is inert. Every number a character needs — height, weight, age,
 * physical traits, abilities — is already in the payload, so a placeholder never has to produce
 * one; what it has to do is let the sheet say `a weary Thrennish smith` and the export render,
 * rather than losing the character to a lookup that missed. Quarantining instead would retire a
 * saved character permanently over a name nothing ever brings back.
 *
 * The adjective and plural are derived from the name because that is what the description prose
 * reads, and a blank adjective would print a sentence with a hole in it. The tables are empty
 * because a placeholder that answered questions about a species this build cannot describe would
 * be inventing one — see {@link isUnknownSpeciesName}, which is how a re-roll is kept from doing
 * exactly that.
 */
export function placeholderSpecies(name: string): Species {
  return {
    name,
    pluralName: `${name}s`,
    adjective: name,
    breedType: '',
    environments: [],
    creatureTypes: [],
    physicalTraitGeneratorConfigs: [],
    ageCategories: [],
    sizeGeneratorConfigMatrix: [],
    abilities: [],
    baseThreatLevel: 0,
    genders: [],
    commonality: 0,
    tags: [],
  };
}

/** Whether a stored species name came back as a placeholder rather than a table this build has. */
export function isUnknownSpeciesName(name: string): boolean {
  return !sentientSpeciesList.some((species) => species.name === name);
}

/** The species a stored name refers to, or an inert stand-in carrying that name. */
export function speciesFromStoredName(name: string): Species {
  return sentientSpeciesList.find((species) => species.name === name) ?? placeholderSpecies(name);
}

/**
 * A stored character, live again.
 *
 * A character whose arms are `null` comes back with none of its own, which is the whole point of
 * that value: the arms are a referenced artifact, and the caller that holds the reference is the
 * one that can resolve it.
 */
export function characterFromStored(stored: StoredCharacter): Character {
  const { speciesName, archetype, heraldry, ...rest } = stored;
  return {
    ...rest,
    species: speciesFromStoredName(speciesName),
    ...(archetype === undefined ? {} : { archetype: archetypeFromStored(archetype) }),
    ...(heraldry === undefined || heraldry === null ? {} : { heraldry: armsFromStored(heraldry) }),
  };
}

/**
 * The codec's reading half, with the signature the kind registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a character is finished when it is stored, and drawing anything from a seed on
 * the way back would be regenerating over the user's edits — the one thing requirement 4.2 forbids.
 */
export function characterFromSnapshot(snapshot: CharacterSnapshot): Character {
  return characterFromStored(snapshot);
}
