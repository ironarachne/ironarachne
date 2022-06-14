'use strict';

import CoinGenerator from '../coingenerator';
import GemGenerator from '../gemgenerator';
import TreasureTable from '../table';
import TreasureTableEntry from '../tableentry';
import * as Dice from '../../../dice';
import ArtObjectGenerator from '../artobjectgenerator';

export function horde(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('6d6x100', '3d6x100', '', '2d6x10', '')),
    ]),
    new TreasureTable([
      new TreasureTableEntry(8, new GemGenerator(900, 1000, Dice.roll('2d6'))),
      new TreasureTableEntry(10, new ArtObjectGenerator(2500, 2500, Dice.roll('2d4'))),
      new TreasureTableEntry(8, new GemGenerator(4500, 5000, Dice.roll('2d6'))),
    ]),
  ];
}

export function individual(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator('5d6', '', '', '', '')),
      new TreasureTableEntry(30, new CoinGenerator('', '4d6', '', '', '')),
      new TreasureTableEntry(10, new CoinGenerator('', '', '3d6', '', '')),
      new TreasureTableEntry(25, new CoinGenerator('', '', '', '3d6', '')),
      new TreasureTableEntry(5, new CoinGenerator('', '', '', '', '1d6')),
    ]),
  ];
}
