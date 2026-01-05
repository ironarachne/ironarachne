import type * as RNG from '@ironarachne/rng';
import * as Dice from '../../../dice.js';
import ArtObjectGenerator from '../artobjectgenerator.js';
import CoinGenerator from '../coingenerator.js';
import GemGenerator from '../gemgenerator.js';
import TreasureTable from '../table.js';
import TreasureTableEntry from '../tableentry.js';

export function horde(rng: RNG.RNG): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('6d6x100', '3d6x100', '', '2d6x10', '', rng)),
    ]),
    new TreasureTable([
      new TreasureTableEntry(8, new GemGenerator(900, 1000, Dice.roll('2d6', rng), rng)),
      new TreasureTableEntry(12, new ArtObjectGenerator(1500, 3500, Dice.roll('2d4', rng), rng)),
      new TreasureTableEntry(8, new GemGenerator(4500, 5000, Dice.roll('2d6', rng), rng)),
    ]),
  ];
}

export function individual(rng: RNG.RNG): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('5d6', '', '', '', '', rng)),
      new TreasureTableEntry(30, new CoinGenerator('', '4d6', '', '', '', rng)),
      new TreasureTableEntry(10, new CoinGenerator('', '', '3d6', '', '', rng)),
      new TreasureTableEntry(25, new CoinGenerator('', '', '', '3d6', '', rng)),
      new TreasureTableEntry(5, new CoinGenerator('', '', '', '', '1d6', rng)),
    ]),
  ];
}
