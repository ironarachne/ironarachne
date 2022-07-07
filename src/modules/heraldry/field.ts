'use strict';

import Variation from './variation';

export default class Field {
  name: string;
  blazon: string;
  variationCount: number;
  pattern: string;
  commonality: number;
  variations: Variation[];

  constructor(
    name: string,
    blazon: string,
    variationCount: number,
    pattern: string,
    commonality: number,
  ) {
    this.name = name;
    this.blazon = blazon;
    this.variationCount = variationCount;
    this.pattern = pattern;
    this.commonality = commonality;
    this.variations = [];
  }

  renderBlazon() {
    let blazon = this.blazon;

    blazon = blazon.replace('variation1', this.variations[0].renderBlazon());

    if (this.variations.length > 1) {
      blazon = blazon.replace('variation2', this.variations[1].renderBlazon());
    }

    return blazon;
  }
}
