/**
 * Editing a saved drug, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction, and it is what lets the editing
 * framework compare what is on screen against what was read to decide whether anything needs
 * saving.
 *
 * **Nothing here recomputes the description.** `describe()` in `drugs.ts` builds the paragraph from
 * the other ten fields, and it is tempting to re-run it whenever one of them changes. That is
 * exactly what 4.2 forbids: the paragraph is the field a user is most likely to have rewritten by
 * hand, and a form that silently regenerated it would throw that away on the next keystroke
 * elsewhere. The description is edited directly, like everything else. `describeDrug` in
 * `drug_presentation.ts` is there for a user who wants the generated wording back.
 *
 * **Changing the drug type does not change the method.** A gas is inhaled and a pill is swallowed,
 * so the two are related — but the method is a sentence the generator drew from the old type's
 * list, and picking a new type cannot know which of the new list's methods the user wanted. It is
 * a field of its own and it stays as it was until the user says otherwise.
 */

import type { DrugSnapshot } from './drug_snapshot.js';

/** Every field of a stored drug, all of which are strings the user may rewrite. */
export type DrugTextField = keyof DrugSnapshot;

export function setDrugText(
  snapshot: DrugSnapshot,
  field: DrugTextField,
  value: string,
): DrugSnapshot {
  return { ...snapshot, [field]: value };
}
