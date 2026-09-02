/**
 * Writing a drug for storage, and reading one back.
 *
 * Both halves live here rather than in a `*_rehydrate.ts` beside it: reading a drug pulls nothing,
 * because everything a stored one holds is a string.
 *
 * **The two table rows are stored by name.** A live `Drug` carries a whole `DrugType` and a whole
 * `EffectType`, and each is a row of a table in this library — `{ name, methods }` and
 * `{ name, effects }`. What the generator used from each is the name, plus the one method and the
 * one effect sentence it drew, and both of those are already fields of their own. Storing the rows
 * whole would copy every *other* method and effect into the payload, where they would go stale the
 * day the table changes. This is the treatment the pass gives species, archetypes and realm types,
 * for the same reason.
 *
 * `docs/readiness-objects.md` asks for that treatment for `EffectType` and says `DrugType`
 * "travels whole". They get the same treatment here: the argument the document makes for one
 * applies exactly to the other, and a payload where one table row is a name and the other is a
 * record is a shape a reader has to remember rather than derive.
 *
 * The result is eleven strings and nothing else, which makes `fromSnapshot` a copy: the live type
 * is rebuilt by resolving the two names against their tables, and a name this build no longer has
 * becomes an inert row rather than a refusal.
 */

import * as DrugTypes from './drug_types.js';
import * as EffectTypes from './effect_types.js';
import type Drug from './drug.js';
import type DrugType from './drug_type.js';
import type EffectType from './effect_type.js';

/** A drug as it is stored: eleven strings. */
export type DrugSnapshot = {
  name: string;
  description: string;
  drugTypeName: string;
  method: string;
  effectTypeName: string;
  effectDescription: string;
  strength: string;
  color: string;
  duration: string;
  sideEffect: string;
  commonality: string;
};

export function toDrugSnapshot(drug: Drug): DrugSnapshot {
  return {
    name: drug.name,
    description: drug.description,
    drugTypeName: drug.drugType.name,
    method: drug.method,
    effectTypeName: drug.effectType.name,
    effectDescription: drug.effectDescription,
    strength: drug.strength,
    color: drug.color,
    duration: drug.duration,
    sideEffect: drug.sideEffect,
    commonality: drug.commonality,
  };
}

/**
 * The drug type a stored name refers to, or an inert row when this build no longer has it.
 *
 * A placeholder rather than a refusal, matching how an unknown species is handled: a drug saved
 * against a build that had a type this one dropped is still a drug, and the method it was taken by
 * is a field of its own that survives regardless.
 */
export function drugTypeFromStoredName(name: string): DrugType {
  return DrugTypes.all().find((type) => type.name === name) ?? { name, methods: [] };
}

/** The effect type a stored name refers to, or an inert row. See {@link drugTypeFromStoredName}. */
export function effectTypeFromStoredName(name: string): EffectType {
  return EffectTypes.all().find((type) => type.name === name) ?? { name, effects: [] };
}

export function drugFromSnapshot(snapshot: DrugSnapshot): Drug {
  return {
    name: snapshot.name,
    description: snapshot.description,
    drugType: drugTypeFromStoredName(snapshot.drugTypeName),
    method: snapshot.method,
    effectType: effectTypeFromStoredName(snapshot.effectTypeName),
    effectDescription: snapshot.effectDescription,
    strength: snapshot.strength,
    color: snapshot.color,
    duration: snapshot.duration,
    sideEffect: snapshot.sideEffect,
    commonality: snapshot.commonality,
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it: a drug is finished when it is
 * stored, and drawing anything from a seed on the way back would be regenerating over the user's
 * edits.
 */
export function drugFromSnapshotWithRng(snapshot: DrugSnapshot, _rng: unknown): Drug {
  return drugFromSnapshot(snapshot);
}
