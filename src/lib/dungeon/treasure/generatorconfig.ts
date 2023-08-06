"use strict";

import TreasureTable from "./table.js";

export default class TreasureGeneratorConfig {
  tables: TreasureTable[];

  constructor() {
    this.tables = [];
  }
}
