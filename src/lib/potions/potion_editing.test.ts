import { describe, expect, it } from 'vitest';

import {
  describePotionSnapshot,
  removePotionModification,
  setPotionContainerText,
  setPotionDescription,
  setPotionEffectText,
  setPotionMagnitude,
  setPotionRarity,
  setPotionSensory,
  setPotionText,
  setPotionValue,
} from './potion_editing';
import { rollPotion } from './potion_roll';
import { toPotionSnapshot, type PotionSnapshot } from './potion_snapshot';

const POTION = toPotionSnapshot(
  rollPotion('editing-seed', { allowHomebrew: false, allowProceduralNames: false }),
);

/** A rolled potion carrying at least one modification. */
function modified(): PotionSnapshot {
  for (let attempt = 0; attempt < 200; attempt++) {
    const potion = rollPotion(`modified-${attempt}`, {
      allowHomebrew: true,
      allowProceduralNames: true,
    });
    if (potion.modifications.length > 0) {
      return toPotionSnapshot(potion);
    }
  }
  throw new Error('no seed in 200 produced a modified potion');
}

describe('setPotionText', () => {
  it('changes one field and nothing else', () => {
    const renamed = setPotionText(POTION, 'displayName', 'Draught of Second Thoughts');

    expect(renamed.displayName).toBe('Draught of Second Thoughts');
    expect(renamed.effect).toEqual(POTION.effect);
    expect(POTION.displayName).not.toBe('Draught of Second Thoughts');
  });

  it('removes an emptied base formula rather than storing it blank', () => {
    const named = setPotionText(POTION, 'canonicalName', 'Potion of Healing');

    expect(named.canonicalName).toBe('Potion of Healing');
    expect('canonicalName' in setPotionText(named, 'canonicalName', '  ')).toBe(false);
  });
});

describe('the effect fields', () => {
  it('rewrite the name and the sentence', () => {
    expect(setPotionEffectText(POTION, 'name', 'Reconsideration').effect.name).toBe(
      'Reconsideration',
    );
    expect(setPotionEffectText(POTION, 'description', 'It helps.').effect.description).toBe(
      'It helps.',
    );
  });

  it('take a magnitude, flooring a cleared or negative one', () => {
    expect(setPotionMagnitude(POTION, 40).effect.magnitude).toBe(40);
    expect(setPotionMagnitude(POTION, Number.NaN).effect.magnitude).toBe(0);
    expect(setPotionMagnitude(POTION, -5).effect.magnitude).toBe(0);
  });

  it('do not reprice the potion', () => {
    // 4.2, and the sharpest temptation here: `resolveCatalogValue` derives the value from the
    // catalog entry and the effect, so re-running it would be arithmetic on a number a referee may
    // have set deliberately.
    expect(setPotionMagnitude(POTION, 99).liquid.value).toBe(POTION.liquid.value);
  });
});

describe('setPotionValue and setPotionRarity', () => {
  it('set the field they name, flooring a cleared value', () => {
    expect(setPotionValue(POTION, 250).liquid.value).toBe(250);
    expect(setPotionValue(POTION, Number.NaN).liquid.value).toBe(0);
    expect(setPotionRarity(POTION, 'legendary').liquid.rarity).toBe('legendary');
  });
});

describe('setPotionSensory', () => {
  it('rewrites one of the four fields', () => {
    const edited = setPotionSensory(POTION, 'flavor', 'like cold iron');

    expect(edited.sensory.flavor).toBe('like cold iron');
    expect(edited.sensory.scent).toBe(POTION.sensory.scent);
  });

  it('accepts an emptied field, which a referee may want', () => {
    expect(setPotionSensory(POTION, 'scent', '').sensory.scent).toBe('');
  });
});

describe('setPotionContainerText', () => {
  it('rewrites the bottle', () => {
    expect(setPotionContainerText(POTION, 'name', 'a chipped vial').container.name).toBe(
      'a chipped vial',
    );
  });
});

describe('removePotionModification', () => {
  it('drops one, leaving the effect where it is', () => {
    // A modification was applied to the numbers when it happened; removing it says the referee has
    // decided it did not, not that the arithmetic should run backwards.
    const withModifications = modified();
    const removed = removePotionModification(withModifications, 0);

    expect(removed.modifications).toHaveLength(withModifications.modifications.length - 1);
    expect(removed.effect).toEqual(withModifications.effect);
  });

  it('does nothing for a modification that is not there', () => {
    expect(removePotionModification(POTION, 99)).toBe(POTION);
    expect(removePotionModification(POTION, -1)).toBe(POTION);
  });
});

describe('describePotionSnapshot', () => {
  it('rebuilds the generated wording', () => {
    expect(describePotionSnapshot(POTION)).toBe(POTION.liquid.description);
  });

  it('follows an edited sensory field, which is what makes the button worth having', () => {
    const edited = setPotionSensory(POTION, 'scent', 'of wet slate');

    expect(describePotionSnapshot(edited)).toContain('wet slate');
  });

  it('is never applied on its own', () => {
    // The guard 4.2 asks for: every setter here leaves the description alone.
    expect(setPotionSensory(POTION, 'flavor', 'sour').liquid.description).toBe(
      POTION.liquid.description,
    );
    expect(setPotionEffectText(POTION, 'name', 'Something Else').liquid.description).toBe(
      POTION.liquid.description,
    );
  });

  it('is what the button writes, and only then', () => {
    const edited = setPotionSensory(POTION, 'scent', 'of wet slate');
    const rewritten = setPotionDescription(edited, describePotionSnapshot(edited));

    expect(rewritten.liquid.description).toContain('wet slate');
  });
});
