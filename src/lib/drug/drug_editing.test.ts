import { describe, expect, it } from 'vitest';

import { setDrugText } from './drug_editing';
import { rollDrugSnapshot } from './drug_roll';

const snapshot = rollDrugSnapshot('editing-seed');

describe('editing a drug', () => {
  it('sets each of the eleven fields', () => {
    for (const field of Object.keys(snapshot) as (keyof typeof snapshot)[]) {
      expect(setDrugText(snapshot, field, 'changed')[field]).toEqual('changed');
    }
  });

  it('changes one field and nothing else (4.4)', () => {
    const edited = setDrugText(snapshot, 'color', 'matte black');
    expect(edited.color).toEqual('matte black');
    expect({ ...edited, color: snapshot.color }).toEqual(snapshot);
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setDrugText(snapshot, 'name', 'something else');
    expect(snapshot.name).toEqual(before);
  });

  it('does not recompute the description when another field changes', () => {
    // 4.2, and the trap this tool sets: `describe()` builds the paragraph from the other ten
    // fields, so a form that re-ran it on every keystroke would throw away a hand-written one.
    const edited = setDrugText(snapshot, 'strength', 'catastrophically potent');
    expect(edited.description).toEqual(snapshot.description);
  });

  it('does not change the method when the form changes', () => {
    // The two are related in the generator and independent in the payload: picking a new form
    // cannot know which of its methods the user meant.
    const edited = setDrugText(snapshot, 'drugTypeName', 'gas');
    expect(edited.method).toEqual(snapshot.method);
  });

  it('accepts an empty value, because clearing a field is an edit', () => {
    expect(setDrugText(snapshot, 'sideEffect', '').sideEffect).toEqual('');
  });
});
