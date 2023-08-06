"use strict";

import TreasureTableEntry from "./tableentry.js";

export default class TreasureTable {
  entries: TreasureTableEntry[];

  constructor(entries: TreasureTableEntry[]) {
    this.entries = entries;
  }
}
