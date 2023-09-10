import type TreasureGenerator from "./treasuregenerator.js";

export default class TreasureTableEntry {
  commonality: number;
  generator: TreasureGenerator;

  constructor(commonality: number, generator: TreasureGenerator) {
    this.commonality = commonality;
    this.generator = generator;
  }
}
