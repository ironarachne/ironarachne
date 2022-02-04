'use strict';

import Tincture from './tincture';

export default class Variation {
  name: string;
  tinctureCount: number;
  blazon: string;
  pattern: string;
  weight: number;
  tinctures: Tincture[];

  constructor(
    name: string,
    tinctureCount: number,
    blazon: string,
    pattern: string,
    weight: number,
  ) {
    this.name = name;
    this.tinctureCount = tinctureCount;
    this.blazon = blazon;
    this.pattern = pattern;
    this.weight = weight;
    this.tinctures = [];
  }

  renderBlazon() {
    let blazon = this.blazon;

    blazon = blazon.replace('tincture1', this.tinctures[0].name);

    if (this.tinctures.length > 1) {
      blazon = blazon.replace('tincture2', this.tinctures[1].name);
    }

    return blazon;
  }

  renderSVGPattern() {
    let svg = this.pattern;

    svg = svg.replaceAll('tincture1', 'url(#' + this.tinctures[0].name + ')');

    if (this.tinctureCount > 1) {
      svg = svg.replaceAll('tincture2', 'url(#' + this.tinctures[1].name + ')');
    }

    return svg;
  }
}
