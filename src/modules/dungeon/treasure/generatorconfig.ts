'use strict';

import TreasureTableEntry from './tableentry';

export default class TreasureGeneratorConfig {
  table: TreasureTableEntry[];

  constructor() {
    this.table = [];
  }
}
