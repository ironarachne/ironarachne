'use strict';

import TreasureTable from './table';

export default class TreasureGeneratorConfig {
  tables: TreasureTable[];

  constructor() {
    this.tables = [];
  }
}
