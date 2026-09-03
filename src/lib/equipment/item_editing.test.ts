import { describe, expect, it } from 'vitest';

import {
  ITEM_COMPOSITION_PARTS,
  describeItem,
  itemBaseDescription,
  itemPartDescription,
  itemPartName,
  itemPropertiesLine,
  removeItemPart,
  setItemDensity,
  setItemNumber,
  setItemPartField,
  setItemProperties,
  setItemRarity,
  setItemText,
} from './item_editing';
import { defaultEquipmentGeneratorConfig, rollItem } from './item_roll';
import { toItemSnapshot, type ItemSnapshot } from './item_snapshot';

const CONFIG = defaultEquipmentGeneratorConfig();

/** A rolled item carrying all four composition parts. */
function composed(): ItemSnapshot {
  for (let attempt = 0; attempt < 400; attempt++) {
    const item = toItemSnapshot(rollItem(`compose-${attempt}`, CONFIG));
    if (ITEM_COMPOSITION_PARTS.every((part) => item[part] !== undefined)) {
      return item;
    }
  }
  throw new Error('no seed in 400 produced an item with all four parts');
}

const ITEM = composed();

describe('setItemText', () => {
  it('changes one field and nothing else', () => {
    const edited = setItemText(ITEM, 'name', 'Sting');

    expect(edited.name).toBe('Sting');
    expect(edited.value).toBe(ITEM.value);
    expect(ITEM.name).not.toBe('Sting');
  });

  it('removes an optional name rather than storing it blank', () => {
    // A cleared unique name reverts the item to being called what it is, not to being called
    // nothing — which is also what `itemName` and the save dialog read.
    const named = setItemText(ITEM, 'uniqueName', 'Bitterlight');
    expect(named.uniqueName).toBe('Bitterlight');
    expect('uniqueName' in setItemText(named, 'uniqueName', '   ')).toBe(false);
    expect('itemMinorType' in setItemText(ITEM, 'itemMinorType', '')).toBe(false);
  });
});

describe('setItemNumber', () => {
  it('takes the number given', () => {
    expect(setItemNumber(ITEM, 'value', 1234).value).toBe(1234);
    expect(setItemNumber(ITEM, 'weight', 2.5).weight).toBe(2.5);
  });

  it('floors a cleared, negative or non-finite field at zero', () => {
    // A number input binds to `NaN` when it is cleared.
    expect(setItemNumber(ITEM, 'value', Number.NaN).value).toBe(0);
    expect(setItemNumber(ITEM, 'weight', -3).weight).toBe(0);
  });
});

describe('setItemRarity and setItemDensity', () => {
  it('set the field they name', () => {
    expect(setItemRarity(ITEM, 'legendary').rarity).toBe('legendary');
    expect(setItemDensity(ITEM, 'airy').densityCategory).toBe('airy');
  });
});

describe('setItemProperties', () => {
  it('reads a comma-separated line, dropping the blanks', () => {
    expect(setItemProperties(ITEM, 'sharp, heavy ,, two-handed,').properties).toEqual([
      'sharp',
      'heavy',
      'two-handed',
    ]);
  });

  it('round-trips through the line the editor shows', () => {
    const edited = setItemProperties(ITEM, 'sharp, heavy');

    expect(itemPropertiesLine(edited)).toBe('sharp, heavy');
    expect(setItemProperties(edited, itemPropertiesLine(edited)).properties).toEqual(
      edited.properties,
    );
  });

  it('empties cleanly', () => {
    expect(setItemProperties(ITEM, '   ').properties).toEqual([]);
  });
});

describe('the composition parts', () => {
  it('reads a part name and description', () => {
    expect(itemPartName(ITEM, 'material')).toBe(ITEM.material?.name);
    expect(itemPartDescription(ITEM, 'enchantment')).toBe(ITEM.enchantment?.description);
  });

  it('reads nothing for a part the item does not have', () => {
    const stripped = removeItemPart(ITEM, 'decoration');

    expect(itemPartName(stripped, 'decoration')).toBe('');
    expect(itemPartDescription(stripped, 'decoration')).toBe('');
  });

  it('reads no description from a material, which has none', () => {
    expect(itemPartDescription(ITEM, 'material')).toBe('');
  });

  it('rewrites one field of one part', () => {
    // The whole reason the records are stored rather than only the paragraph.
    const edited = setItemPartField(ITEM, 'enchantment', 'name', 'Ashbite');

    expect(edited.enchantment?.name).toBe('Ashbite');
    expect(edited.enchantment?.magnitude).toBe(ITEM.enchantment?.magnitude);
    expect(edited.material).toEqual(ITEM.material);
  });

  it('does nothing to a part the item does not have', () => {
    const stripped = removeItemPart(ITEM, 'refinement');

    expect(setItemPartField(stripped, 'refinement', 'name', 'invented')).toBe(stripped);
  });

  it('does not give a material a description it has no field for', () => {
    expect(setItemPartField(ITEM, 'material', 'description', 'shiny')).toBe(ITEM);
  });

  it('removes a part, leaving the numbers it contributed where they are', () => {
    // 4.2: the value is the item's now, and removing a decoration is not a request to reprice it.
    const stripped = removeItemPart(ITEM, 'decoration');

    expect('decoration' in stripped).toBe(false);
    expect(stripped.value).toBe(ITEM.value);
    expect(stripped.weight).toBe(ITEM.weight);
  });

  it('returns the same object when there is nothing to remove', () => {
    const stripped = removeItemPart(ITEM, 'decoration');

    expect(removeItemPart(stripped, 'decoration')).toBe(stripped);
  });
});

describe('itemBaseDescription', () => {
  it('recovers the type sentence the composition was written over', () => {
    const base = itemBaseDescription(ITEM);

    expect(base).not.toBe('');
    expect(ITEM.description).toContain(base);
  });

  it('yields nothing for a type this build does not have', () => {
    expect(itemBaseDescription({ ...ITEM, itemMinorType: 'plasma glaive' })).toBe('');
    expect(itemBaseDescription({ ...ITEM, itemMinorType: undefined })).toBe('');
  });
});

describe('describeItem', () => {
  it('rebuilds the generated wording rather than nesting the stored paragraph', () => {
    // `generateItem` writes the composed paragraph back over the field it composed *from*, so
    // re-running the composer on a stored item would embed the whole paragraph inside itself.
    const rewritten = describeItem(ITEM);

    expect(rewritten).toBe(ITEM.description);
    expect(describeItem({ ...ITEM, description: rewritten })).toBe(rewritten);
  });

  it('follows an edited part, which is what makes the button worth having', () => {
    const edited = setItemPartField(ITEM, 'enchantment', 'description', 'It hums in the cold.');

    expect(describeItem(edited)).toContain('It hums in the cold.');
  });

  it('is never applied on its own', () => {
    // The guard 4.2 asks for: every setter here leaves the description alone.
    const edited = setItemPartField(ITEM, 'refinement', 'name', 'master-forged');

    expect(edited.description).toBe(ITEM.description);
  });
});
