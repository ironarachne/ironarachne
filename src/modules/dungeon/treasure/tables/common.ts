'use strict';

import CoinGenerator from '../coingenerator';
import TreasureTableEntry from '../tableentry';

export function horde(): TreasureTableEntry[] {
  return [new TreasureTableEntry(30, new CoinGenerator('6d6x100', '3d6x100', '', '2d6x10', ''))];
}

export function individual(): TreasureTableEntry[] {
  return [
    new TreasureTableEntry(30, new CoinGenerator('5d6', '', '', '', '')),
    new TreasureTableEntry(30, new CoinGenerator('', '4d6', '', '', '')),
    new TreasureTableEntry(10, new CoinGenerator('', '', '3d6', '', '')),
    new TreasureTableEntry(25, new CoinGenerator('', '', '', '3d6', '')),
    new TreasureTableEntry(5, new CoinGenerator('', '', '', '', '1d6')),
  ];
}
