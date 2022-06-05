'use strict';

import type TreasureGenerator from './treasuregenerator';

export default class TreasureTableEntry {
  commonality: number;
  generator: TreasureGenerator;

  constructor(commonality: number, generator: TreasureGenerator) {
    this.commonality = commonality;
    this.generator = generator;
  }
}
