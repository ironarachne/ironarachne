'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDClass from '../adndclass';
import SpellFilter from '../spellfilter';
import * as RND from '../../random';
import * as Spells from '../spells';

export default new ADNDClass(
  'illusionist',
  'wizard',
  '1d4',
  -1,
  16,
  -1,
  9,
  -1,
  -1,
  ['intelligence'],
  [
    'Create magical items',
    'Cast wizard spells (other than abjuration, invocation, evocation, or necromancy)',
  ],
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
      filter: new SpellFilter('', 1, 'wizard', ['illusion'], []),
      count: 1,
    },
    {
      filter: new SpellFilter(
        '',
        1,
        'wizard',
        [],
        ['abjuration', 'invocation', 'evocation', 'necromancy'],
      ),
      count: 1,
    },
  ],
  ['dagger', 'staff', 'dart', 'knife', 'sling'],
  ['none'],
  1,
  4,
  -5,
  function (character: ADNDCharacter): ADNDCharacter {
    let allSpells = Spells.getAll();
    for (let i = 0; i < this.spellList.length; i++) {
      let filteredSpells = Spells.getFilteredSpells(this.spellList[i].filter, allSpells);
      filteredSpells = RND.shuffle(filteredSpells);
      for (let j = 0; j < this.spellList[i].count; j++) {
        character.spells.push(filteredSpells.pop());
      }
    }
    return character;
  },
);
