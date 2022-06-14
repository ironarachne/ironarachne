'use strict';

import ArtObjectGenerator from '../artobjectgenerator';
import CoinGenerator from '../coingenerator';
import GemGenerator from '../gemgenerator';
import TreasureTable from '../table';
import TreasureTableEntry from '../tableentry';
import * as Dice from '../../../dice';

export function horde(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('2d6x100', '2d6x1000', '', '6d6x100', '3d6x10')),
    ]),
    new TreasureTable([
      new TreasureTableEntry(20, new ArtObjectGenerator(1500, 3000, Dice.roll('2d4'))),
      new TreasureTableEntry(30, new GemGenerator(4500, 5000, Dice.roll('2d6'))),
      new TreasureTableEntry(8, new GemGenerator(9500, 10000, Dice.roll('3d6'))),
      new TreasureTableEntry(10, new ArtObjectGenerator(20000, 30000, Dice.roll('2d4'))),
    ]),
  ];
}

export function individual(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('4d6x100', '', '1d6x10', '', '')),
      new TreasureTableEntry(30, new CoinGenerator('', '6d6x10', '', '2d6x10', '')),
      new TreasureTableEntry(10, new CoinGenerator('', '', '1d6x100', '2d6x10', '')),
      new TreasureTableEntry(25, new CoinGenerator('', '', '', '4d6x10', '')),
      new TreasureTableEntry(5, new CoinGenerator('', '', '', '2d6x10', '3d6')),
    ]),
  ];
}
