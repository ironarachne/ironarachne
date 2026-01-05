import type * as RNG from '@ironarachne/rng';
import type TreasureTable from './table.js';

export default class TreasureGeneratorConfig {
  tables: TreasureTable[];
  rng: RNG.RNG;

  constructor(rng: RNG.RNG) {
    this.tables = [];
    this.rng = rng;
  }
}
