'use strict';

import ADNDCharacter from '../adndcharacter';
import ADNDClass from '../adndclass';
import SpellFilter from '../spellfilter';
import * as RND from '../../random';
import * as Spells from '../spells';

export default new ADNDClass(
  'druid',
  'priest',
  '1d8',
  -1,
  -1,
  -1,
  -1,
  12,
  15,
  ['wisdom'],
  [
    'Cast priest spells',
    'Speak druidic',
    '+2 bonus to saving throws vs. fire or electrical attacks',
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
  ['priest'],
  [
    {
      filter: new SpellFilter(
        '',
        1,
        'priest',
        ['plant', 'animal', 'healing', 'weather', 'elemental'],
        [],
      ),
      count: 1,
    },
  ],
  ['club', 'sickle', 'spear', 'scimitar', 'dagger', 'staff', 'dart', 'sling'],
  ['leather', 'studded leather', 'wooden shield'],
  2,
  4,
  -3,
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
