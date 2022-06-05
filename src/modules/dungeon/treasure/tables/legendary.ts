'use strict';

import CoinGenerator from '../coingenerator';
import TreasureTableEntry from '../tableentry';

export function horde(): TreasureTableEntry[] {
  return [new TreasureTableEntry(30, new CoinGenerator('', '', '', '12d6x1000', '8d6x1000'))];
}

export function individual(): TreasureTableEntry[] {
  return [
    new TreasureTableEntry(15, new CoinGenerator('', '', '2d6x1000', '8d6x100', '')),
    new TreasureTableEntry(40, new CoinGenerator('', '', '', '1d6x1000', '1d6x100')),
    new TreasureTableEntry(45, new CoinGenerator('', '', '', '1d6x1000', '2d6x100')),
  ];
}
