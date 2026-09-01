/**
 * Rebuilding a creature from its stored form, kept apart from `creature_snapshot.ts` for the reason
 * the character's halves are: resolving a species reaches the whole species table, and nothing that
 * merely lists or validates a payload needs it.
 *
 * **Nothing here is recomputed.** Height, weight, age, traits, abilities: all of it comes back
 * exactly as it was stored, per requirement 4.2 in docs/workshop.md. The species is resolved by
 * name only so a sheet can say what it was.
 */

import { allSpecies, type Species } from '$lib/species';

import type { StoredCreature } from './creature_snapshot.js';
import type { Creature } from './creature_types.js';

/**
 * A species this build does not have, carrying nothing but the name it was stored under.
 *
 * The point of it is that it is inert. Every number a creature or character needs is already in
 * the payload, so a placeholder never has to produce one; what it has to do is let the sheet say
 * `a weary Thrennish smith` and the export render, rather than losing the record to a lookup that
 * missed. Quarantining instead would retire a saved creature permanently over a name nothing ever
 * brings back.
 *
 * The adjective and plural are derived from the name because that is what description prose reads,
 * and a blank adjective would print a sentence with a hole in it. The tables are empty because a
 * placeholder that answered questions about a species this build cannot describe would be
 * inventing one.
 *
 * Declared here rather than in `$lib/characters`, where it lived until #54, because a placeholder
 * species is a creature-level concept and a character is a creature. `$lib/characters` re-exports
 * it.
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

/**
 * The species a stored creature's name refers to, or an inert stand-in carrying that name.
 *
 * Searched across every species this build has, sentient or not: a creature in an encounter is
 * normally a beast, but a species mutator can turn a band of cultists into ghouls, and the name
 * stored is whatever the mutator left.
 */
export function creatureSpeciesFromStoredName(name: string): Species {
  return allSpecies.find((species) => species.name === name) ?? placeholderSpecies(name);
}

/** A stored creature, live again. */
export function creatureFromStored(stored: StoredCreature): Creature {
  const { speciesName, ...rest } = stored;
  return { ...rest, species: creatureSpeciesFromStoredName(speciesName) };
}
