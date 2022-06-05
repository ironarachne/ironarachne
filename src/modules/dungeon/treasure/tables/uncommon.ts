'use strict';

import CoinGenerator from '../coingenerator';
import TreasureTableEntry from '../tableentry';

export function horde(): TreasureTableEntry[] {
  return [
    new TreasureTableEntry(30, new CoinGenerator('2d6x100', '2d6x1000', '', '6d6x100', '3d6x10')),
  ];
}

export function individual(): TreasureTableEntry[] {
  return [
    new TreasureTableEntry(30, new CoinGenerator('4d6x100', '', '1d6x10', '', '')),
    new TreasureTableEntry(30, new CoinGenerator('', '6d6x10', '', '2d6x10', '')),
    new TreasureTableEntry(10, new CoinGenerator('', '', '1d6x100', '2d6x10', '')),
    new TreasureTableEntry(25, new CoinGenerator('', '', '', '4d6x10', '')),
    new TreasureTableEntry(5, new CoinGenerator('', '', '', '2d6x10', '3d6')),
  ];
}
