import { describe, expect, it } from 'vitest';

import { removeItemPart, setItemProperties, setItemText } from './item_editing';
import {
  itemDisplayName,
  itemFileStem,
  itemListToMarkdown,
  itemListToText,
  itemToDocument,
  itemToMarkdown,
  itemToText,
} from './item_presentation';
import { defaultEquipmentGeneratorConfig, rollItem, rollItems } from './item_roll';
import { toItemSnapshot, type ItemSnapshot } from './item_snapshot';

const CONFIG = defaultEquipmentGeneratorConfig();

const WEAPON = toItemSnapshot(rollItem('weapon-seed', { ...CONFIG, itemMajorType: 'weapon' }));
const ARMOR = toItemSnapshot(rollItem('armor-seed', { ...CONFIG, itemMajorType: 'armor' }));

function labels(item: ItemSnapshot, system: 'dnd5e' | 'ironarachne' = 'dnd5e'): string[] {
  return itemToDocument(item, system).lines.map((line) => line.label);
}

describe('itemDisplayName', () => {
  it('prefers the unique name and falls back twice', () => {
    expect(itemDisplayName({ name: 'longsword', uniqueName: 'Bitterlight' })).toBe('Bitterlight');
    expect(itemDisplayName({ name: 'longsword', uniqueName: '  ' })).toBe('longsword');
    expect(itemDisplayName({ name: '', uniqueName: undefined })).toBe('Item');
  });
});

describe('itemToDocument', () => {
  it('names the composition rather than only describing it', () => {
    // The card showed a sentence saying a blade was finely balanced and never said the refinement
    // was called anything. Storing the records is what makes these lines possible.
    const composed = itemToDocument({
      ...WEAPON,
      material: { ...(WEAPON.material ?? ({} as never)), name: 'meteoric iron' },
      refinement: { name: 'master-forged', description: 'It is beautifully made.' },
    });

    expect(composed.lines).toContainEqual({ label: 'Material', value: 'meteoric iron' });
    expect(composed.lines).toContainEqual({ label: 'Refinement', value: 'master-forged' });
  });

  it('quotes a weapon damage and an armour class', () => {
    expect(labels(WEAPON)).toContain('Damage');
    expect(labels(ARMOR)).toContain('Armour class');
  });

  it('changes only how the numbers read when the display system changes', () => {
    // The reason the display system is not part of the roll: both describe the same item.
    expect(labels(ARMOR, 'ironarachne')).toContain('Defence');
    expect(labels(ARMOR, 'ironarachne')).not.toContain('Armour class');
    expect(itemToDocument(ARMOR, 'dnd5e').title).toBe(itemToDocument(ARMOR, 'ironarachne').title);
  });

  it('drops every line whose field is empty', () => {
    // 6.4, line by line: an edited item can be empty in a dozen places.
    const stripped = ['material', 'refinement', 'enchantment', 'decoration'].reduce(
      (item, part) => removeItemPart(item, part as 'material'),
      WEAPON,
    );

    expect(labels(stripped)).not.toContain('Material');
    expect(labels(stripped)).not.toContain('Enchantment');
    expect(labels(stripped)).toContain('Value');
  });

  it('drops empty properties', () => {
    expect(itemToDocument(setItemProperties(WEAPON, '  ,  ')).properties).toEqual([]);
  });
});

describe('itemToMarkdown', () => {
  it('heads the sheet with the item name and lists what it is', () => {
    const markdown = itemToMarkdown(WEAPON);

    expect(markdown.startsWith(`# ${itemDisplayName(WEAPON)}\n\n`)).toBe(true);
    expect(markdown).toContain('- Value: ');
    expect(markdown).toContain('- Damage: ');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('exports an item emptied of everything as its name and the three facts left', () => {
    // 6.4. What survives is what is always true of an item — what it is, how rare, how heavy — and
    // a value written out rather than dropped, which is the fault #65 found in the price lists.
    const bare: ItemSnapshot = {
      id: 'x',
      name: 'thing',
      itemMajorType: 'misc',
      description: '',
      value: 0,
      rarity: 'common',
      densityCategory: 'standard',
      weight: 0,
      properties: [],
      mechanics: { variants: [] },
    };

    expect(itemToMarkdown(bare)).toBe(
      '# thing\n\n- Type: misc\n- Rarity: common\n- Value: 0 cp\n- Weight: 0.0 lbs\n',
    );
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(itemToMarkdown(WEAPON)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('itemToText', () => {
  it('writes the same sheet without the title the PDF draws itself', () => {
    const text = itemToText(WEAPON);

    expect(text).not.toContain(`# ${itemDisplayName(WEAPON)}`);
    expect(text).toContain('Value: ');
    expect(text.endsWith('\n')).toBe(false);
  });

  it('is empty for an item with nothing left to say', () => {
    const bare = setItemProperties(setItemText({ ...WEAPON, value: 0 }, 'description', ''), '');

    // The lines survive — a value and a weight are always printable — so this checks the shape
    // rather than emptiness.
    expect(itemToText(bare)).not.toMatch(/^\n/);
  });
});

describe('itemListToMarkdown', () => {
  it('writes one section per item under one heading', () => {
    const items = rollItems('press', 3, CONFIG).map(toItemSnapshot);
    const markdown = itemListToMarkdown(items);

    expect(markdown.startsWith('# Equipment\n\n')).toBe(true);
    for (const item of items) {
      expect(markdown).toContain(`## ${itemDisplayName(item)}`);
    }
    expect(markdown).not.toMatch(/\n\s*\n\s*\n/);
  });

  it('writes the heading and nothing else for an empty press', () => {
    expect(itemListToMarkdown([])).toBe('# Equipment\n');
  });
});

describe('itemListToText', () => {
  it('names each item above its own lines', () => {
    const items = [WEAPON, ARMOR];
    const text = itemListToText(items);

    expect(text).toContain(itemDisplayName(WEAPON));
    expect(text).toContain(itemDisplayName(ARMOR));
    expect(text).not.toContain('# ');
  });

  it('is empty for an empty press', () => {
    expect(itemListToText([])).toBe('');
  });
});

describe('itemFileStem', () => {
  it('reduces a name to something a filesystem takes', () => {
    expect(itemFileStem({ name: 'longsword', uniqueName: "Bitterlight, the Wolf's Woe" })).toBe(
      'item-bitterlight-the-wolf-s-woe',
    );
    expect(itemFileStem({ name: 'plate armor' })).toBe('item-plate-armor');
  });

  it('falls back for a name that reduces to nothing', () => {
    expect(itemFileStem({ name: '???' })).toBe('item');
    expect(itemFileStem({ name: 'Item' })).toBe('item');
  });
});
