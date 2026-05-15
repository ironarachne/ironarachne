import type { RNG } from '@ironarachne/rng';
import ADNDCharacter from '../adndcharacter.js';
import ADNDRace from '../adndrace.js';
import { applyHalflingWithOptions, randomHalflingApplyOptions } from './halfling_apply.js';

export default new ADNDRace(
  'halfling',
  'halfling',
  function (character: ADNDCharacter, rng: RNG): ADNDCharacter {
    return applyHalflingWithOptions(character, randomHalflingApplyOptions(rng));
  },
  7,
  18,
  7,
  18,
  10,
  18,
  6,
  18,
  3,
  17,
  3,
  18,
  32,
  30,
  52,
  48,
  '2d8',
  '5d4',
  20,
  6,
  '3d4',
  ['common', 'halfling', 'dwarf', 'elf', 'gnome', 'goblin', 'orc'],
  ['cleric', 'fighter', 'thief'],
);
