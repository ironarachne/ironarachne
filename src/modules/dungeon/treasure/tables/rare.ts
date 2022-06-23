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
      new TreasureTableEntry(30, new CoinGenerator('', '', '', '4d6x1000', '5d6x100')),
    ]),
    new TreasureTable([
      new TreasureTableEntry(20, new ArtObjectGenerator(20000, 30000, Dice.roll('2d4'))),
      new TreasureTableEntry(30, new GemGenerator(45000, 50000, Dice.roll('3d6'))),
      new TreasureTableEntry(8, new GemGenerator(95000, 100000, Dice.roll('3d6'))),
      new TreasureTableEntry(10, new ArtObjectGenerator(70000, 80000, Dice.roll('2d4'))),
    ]),
  ];
}

export function individual(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(20, new CoinGenerator('', '4d6x100', '', '1d6x100', '')),
      new TreasureTableEntry(15, new CoinGenerator('', '', '1d6x100', '1d6x100', '')),
      new TreasureTableEntry(40, new CoinGenerator('', '', '', '2d6x100', '1d6x10')),
      new TreasureTableEntry(25, new CoinGenerator('', '', '', '2d6x100', '2d6x10')),
    ]),
  ];
}
