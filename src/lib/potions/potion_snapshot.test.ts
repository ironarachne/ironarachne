import { describe, expect, it } from 'vitest';

import { defaultPotionGeneratorConfigRecord, rollPotion } from './potion_roll';
import { potionFromSnapshot, toPotionSnapshot } from './potion_snapshot';

const CONFIG = defaultPotionGeneratorConfigRecord();
const POTION = rollPotion('snapshot-seed', CONFIG);
const SNAPSHOT = toPotionSnapshot(POTION);

/** A seed that rolls a potion carrying at least one modification. */
function modified() {
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

describe('toPotionSnapshot', () => {
  it('keeps the container, the liquid, the effect and the sensory profile', () => {
    expect(SNAPSHOT.container.name).not.toBe('');
    expect(SNAPSHOT.liquid.id).not.toBe('');
    expect(SNAPSHOT.effect.name).not.toBe('');
    expect(SNAPSHOT.sensory.appearance).not.toBe('');
  });

  it('stores the effect and the sensory profile once, not twice', () => {
    // `generatePotion` writes both into the liquid *and* onto the potion beside it. Two copies of
    // one fact is a shape where an editor changes one and the other goes stale.
    expect('effect' in SNAPSHOT.liquid).toBe(false);
    expect('sensory' in SNAPSHOT.liquid).toBe(false);
    expect('name' in SNAPSHOT.liquid).toBe(false);
  });

  it('keeps the two ids that say which bottle this liquid is in', () => {
    expect(SNAPSHOT.container.contents).toContain(SNAPSHOT.liquid.id);
    expect(SNAPSHOT.liquid.containerId).toBe(SNAPSHOT.container.id);
  });
});

describe('potionFromSnapshot', () => {
  it('round-trips everything that matters', () => {
    // Requirement 7.2.
    expect(toPotionSnapshot(potionFromSnapshot(SNAPSHOT))).toEqual(SNAPSHOT);
  });

  it('rebuilds the live potion the generator produced', () => {
    expect(potionFromSnapshot(SNAPSHOT)).toEqual(POTION);
  });

  it('round-trips a modified potion', () => {
    const withModifications = modified();

    expect(withModifications.modifications.length).toBeGreaterThan(0);
    expect(toPotionSnapshot(potionFromSnapshot(withModifications))).toEqual(withModifications);
  });

  it('survives a trip through JSON, which is what storage is', () => {
    expect(potionFromSnapshot(JSON.parse(JSON.stringify(SNAPSHOT)))).toEqual(POTION);
  });

  it('puts the three derived fields back where the live type expects them', () => {
    const live = potionFromSnapshot(SNAPSHOT);

    expect(live.liquid.name).toBe(SNAPSHOT.displayName);
    expect(live.liquid.effect).toEqual(SNAPSHOT.effect);
    expect(live.liquid.sensory).toEqual(SNAPSHOT.sensory);
  });

  it('follows an edited name and effect into the liquid, which is the point', () => {
    // The reason the duplication went: there is one place to edit an effect and one answer to what
    // it is.
    const edited = {
      ...SNAPSHOT,
      displayName: 'Draught of Second Thoughts',
      effect: { ...SNAPSHOT.effect, name: 'Reconsideration' },
    };
    const live = potionFromSnapshot(edited);

    expect(live.liquid.name).toBe('Draught of Second Thoughts');
    expect(live.liquid.effect.name).toBe('Reconsideration');
  });

  it('copies deeply enough that an editor cannot reach the stored record', () => {
    const read = potionFromSnapshot(SNAPSHOT);

    read.modifications.push({ kind: 'tainted' });
    read.container.contents.push('tampered');
    read.liquid.properties.push('tampered');

    expect(SNAPSHOT.modifications).toHaveLength(POTION.modifications.length);
    expect(SNAPSHOT.container.contents).not.toContain('tampered');
    expect(SNAPSHOT.liquid.properties).not.toContain('tampered');
  });

  it('recomputes nothing on read', () => {
    // Requirement 4.2: a value a referee set by hand is the potion's value, not an input to a
    // catalog lookup that runs again every time the artifact is opened.
    const edited = { ...SNAPSHOT, liquid: { ...SNAPSHOT.liquid, value: 7 } };

    expect(potionFromSnapshot(edited).liquid.value).toBe(7);
  });
});
