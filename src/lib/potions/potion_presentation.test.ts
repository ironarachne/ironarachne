import { describe, expect, it } from 'vitest';

import {
  removePotionModification,
  setPotionContainerText,
  setPotionDescription,
  setPotionSensory,
  setPotionText,
} from './potion_editing';
import {
  describeModification,
  potionDisplayName,
  potionFileStem,
  potionForm,
  potionToDocument,
  potionToMarkdown,
  potionToText,
  potionValueText,
} from './potion_presentation';
import { rollPotion } from './potion_roll';
import { toPotionSnapshot, type PotionSnapshot } from './potion_snapshot';

const POTION = toPotionSnapshot(
  rollPotion('presentation-seed', { allowHomebrew: false, allowProceduralNames: false }),
);

/** A rolled potion of the form asked for, found by trying seeds. */
function ofForm(form: 'oil' | 'ointment'): PotionSnapshot {
  for (let attempt = 0; attempt < 400; attempt++) {
    const snapshot = toPotionSnapshot(
      rollPotion(`${form}-${attempt}`, { allowHomebrew: false, allowProceduralNames: false }),
    );
    if (potionForm(snapshot) === form) {
      return snapshot;
    }
  }
  throw new Error(`no seed in 400 produced ${form}`);
}

function labels(snapshot: PotionSnapshot): string[] {
  return potionToDocument(snapshot).lines.map((line) => line.label);
}

describe('potionDisplayName', () => {
  it('prefers the label on the bottle and falls back twice', () => {
    expect(potionDisplayName(POTION)).toBe(POTION.displayName);
    expect(
      potionDisplayName({ ...POTION, displayName: ' ', canonicalName: 'Potion of Healing' }),
    ).toBe('Potion of Healing');
    expect(potionDisplayName({ ...POTION, displayName: '', canonicalName: undefined })).toBe(
      'Potion',
    );
  });
});

describe('potionForm', () => {
  it('reads the form out of the properties the generator wrote', () => {
    // The page did this inline in a nested ternary, where nothing could test it.
    expect(potionForm(ofForm('oil'))).toBe('oil');
    expect(potionForm(ofForm('ointment'))).toBe('ointment');
  });

  it('defaults to a drink, which is what a potion is unless it says otherwise', () => {
    expect(potionForm({ ...POTION, liquid: { ...POTION.liquid, properties: [] } })).toBe('drink');
  });
});

describe('potionValueText', () => {
  it('quotes a price in coins and writes out nothing rather than leaving it blank', () => {
    // The fault #65 found in the price lists: `valueToString(0)` is the empty string.
    expect(potionValueText(100)).toBe('1 gp');
    expect(potionValueText(0)).toBe('0 cp');
  });
});

describe('describeModification', () => {
  it('reads a tagged union as a sentence a referee can use', () => {
    expect(describeModification({ kind: 'tainted' })).toBe('tainted');
    expect(describeModification({ kind: 'homebrew' })).toBe('homebrew');
    expect(describeModification({ kind: 'duration', change: 'extended' })).toBe(
      'extended duration',
    );
    expect(describeModification({ kind: 'potency', tier: 'heightened', magnitudeDelta: 10 })).toBe(
      'heightened (magnitude +10)',
    );
  });

  it('names a kind this build does not know rather than printing nothing', () => {
    expect(
      describeModification({ kind: 'chronomantic' } as unknown as Parameters<
        typeof describeModification
      >[0]),
    ).toBe('chronomantic');
  });
});

describe('potionToDocument', () => {
  it('arranges the potion, its effect, its senses and its bottle', () => {
    const document = potionToDocument(POTION);

    expect(document.title).toBe(POTION.displayName);
    expect(labels(POTION)).toContain('Form');
    expect(labels(POTION)).toContain('Rarity');
    expect(labels(POTION)).toContain('Value');
    expect(document.effect.description).not.toBe('');
    expect(document.sensory).toHaveLength(4);
    expect(document.container.name).toBe(POTION.container.name);
  });

  it('drops a base formula that says the same thing as the name', () => {
    // 6.4: printing "Base formula: Potion of Healing" under a heading reading "Potion of Healing"
    // is a line that says nothing.
    const same = { ...POTION, canonicalName: POTION.displayName };

    expect(labels(same)).not.toContain('Base formula');
    expect(labels({ ...POTION, canonicalName: 'Potion of Healing' })).toContain('Base formula');
  });

  it('drops the modifications line when nothing was done to the formula', () => {
    expect(labels({ ...POTION, modifications: [] })).not.toContain('Modifications');
    expect(labels({ ...POTION, modifications: [{ kind: 'tainted' }] })).toContain('Modifications');
  });

  it('drops every sensory field that has been cleared', () => {
    const stripped = (['appearance', 'viscosity', 'flavor', 'scent'] as const).reduce(
      (snapshot, field) => setPotionSensory(snapshot, field, ''),
      POTION,
    );

    expect(potionToDocument(stripped).sensory).toEqual([]);
  });
});

describe('potionToMarkdown', () => {
  it('writes the potion, the effect, the senses and the bottle', () => {
    const markdown = potionToMarkdown(POTION);

    expect(markdown.startsWith(`# ${POTION.displayName}\n\n`)).toBe(true);
    expect(markdown).toContain('- Rarity: ');
    expect(markdown).toContain('## Effect');
    expect(markdown).toContain('## Sensory profile');
    expect(markdown).toContain('## Container');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('prints no sensory heading when every field has been cleared', () => {
    const stripped = (['appearance', 'viscosity', 'flavor', 'scent'] as const).reduce(
      (snapshot, field) => setPotionSensory(snapshot, field, ''),
      POTION,
    );

    expect(potionToMarkdown(stripped)).not.toContain('## Sensory profile');
  });

  it('prints no container heading for a potion with no bottle left', () => {
    expect(potionToMarkdown(setPotionContainerText(POTION, 'name', ''))).not.toContain(
      '## Container',
    );
  });

  it('exports a potion emptied of everything as little more than its name', () => {
    const bare = setPotionDescription(
      setPotionContainerText(
        (['appearance', 'viscosity', 'flavor', 'scent'] as const).reduce(
          (snapshot, field) => setPotionSensory(snapshot, field, ''),
          setPotionText({ ...POTION, modifications: [] }, 'canonicalName', ''),
        ),
        'name',
        '',
      ),
      '',
    );
    const markdown = potionToMarkdown(bare);

    expect(markdown).not.toContain('## Sensory profile');
    expect(markdown).not.toContain('## Container');
    expect(markdown).toContain(`# ${POTION.displayName}`);
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(potionToMarkdown(POTION)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('potionToText', () => {
  it('writes the same sheet without the title the PDF draws itself', () => {
    const text = potionToText(POTION);

    expect(text).not.toContain(`# ${POTION.displayName}`);
    expect(text).toContain('Effect');
    expect(text).toContain('Sensory profile');
    expect(text).toContain('Container: ');
    expect(text.endsWith('\n')).toBe(false);
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(potionToText(POTION)).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('potionFileStem', () => {
  it('reduces a name to something a filesystem takes', () => {
    expect(potionFileStem({ ...POTION, displayName: "Ashgrave's Weeping Draught" })).toBe(
      'potion-ashgrave-s-weeping-draught',
    );
  });

  it('falls back for a name that reduces to nothing', () => {
    expect(potionFileStem({ ...POTION, displayName: '???', canonicalName: undefined })).toBe(
      'potion',
    );
  });
});

describe('a potion with its modifications removed', () => {
  it('still reads as a potion', () => {
    // The editor can strip them one at a time; the sheet must not develop a hole.
    let stripped = POTION;
    while (stripped.modifications.length > 0) {
      stripped = removePotionModification(stripped, 0);
    }

    expect(potionToDocument(stripped).title).toBe(POTION.displayName);
    expect(potionToMarkdown(stripped)).not.toContain('Modifications');
  });
});
