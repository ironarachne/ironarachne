import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from '../adndcharacter.js';
import ADNDClass from '../adndclass.js';
import SpellFilter from '../spellfilter.js';
import * as Spells from '../spells.js';

export default new ADNDClass(
  'abjurer',
  'wizard',
  '1d4',
  -1,
  -1,
  -1,
  9,
  15,
  -1,
  ['intelligence'],
  ['Create magical items', 'Cast wizard spells'],
  [
    'lawful good',
    'lawful neutral',
    'lawful evil',
    'neutral good',
    'true neutral',
    'neutral evil',
    'chaotic evil',
    'chaotic neutral',
    'chaotic good',
  ],
  true,
  ['wizard'],
  [
    {
      filter: new SpellFilter('', 1, 'wizard', ['abjuration'], []),
      count: 1,
    },
    {
      filter: new SpellFilter('', 1, 'wizard', [], ['alteration', 'illusion']),
      count: 1,
    },
  ],
  ['dagger', 'staff', 'dart', 'knife', 'sling'],
  ['none'],
  1,
  4,
  -5,
  function (this: ADNDClass, character: ADNDCharacter, rng: RNG.RNG): ADNDCharacter {
    const allSpells = Spells.getAll();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = Spells.getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = rng.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        const filteredSpell = filteredSpells.pop();
        if (filteredSpell === undefined) {
          throw new Error('Spell is undefined.');
        }
        character.spells.push(filteredSpell);
      }
    }
    return character;
  },
);
