'use strict';

import TreasureTableEntry from './tableentry';

export default class TreasureTable {
  entries: TreasureTableEntry[];

  constructor(entries: TreasureTableEntry[]) {
    this.entries = entries;
  }
}
