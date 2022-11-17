'use strict';

import ADNDClass from '../adndclass';
import abjurer from './abjurer';
import bard from './bard';
import cleric from './cleric';
import conjurer from './conjurer';
import diviner from './diviner';
import druid from './druid';
import enchanter from './enchanter';
import fighter from './fighter';
import illusionist from './illusionist';
import invoker from './invoker';
import mage from './mage';
import necromancer from './necromancer';
import paladin from './paladin';
import ranger from './ranger';
import thief from './thief';
import transmuter from './transmuter';

export function getAll(): ADNDClass[] {
  return [
    abjurer,
    bard,
    cleric,
    conjurer,
    diviner,
    druid,
    enchanter,
    fighter,
    illusionist,
    invoker,
    mage,
    necromancer,
    paladin,
    ranger,
    thief,
    transmuter,
  ];
}
