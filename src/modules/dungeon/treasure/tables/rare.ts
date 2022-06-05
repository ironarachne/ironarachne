'use strict';

import CoinGenerator from '../coingenerator';
import TreasureTableEntry from '../tableentry';

export function horde(): TreasureTableEntry[] {
  return [new TreasureTableEntry(30, new CoinGenerator('', '', '', '4d6x1000', '5d6x100'))];
}

export function individual(): TreasureTableEntry[] {
  return [
    new TreasureTableEntry(20, new CoinGenerator('', '4d6x100', '', '1d6x100', '')),
    new TreasureTableEntry(15, new CoinGenerator('', '', '1d6x100', '1d6x100', '')),
    new TreasureTableEntry(40, new CoinGenerator('', '', '', '2d6x100', '1d6x10')),
    new TreasureTableEntry(25, new CoinGenerator('', '', '', '2d6x100', '2d6x10')),
  ];
}
