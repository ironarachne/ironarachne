'use strict';

import Tincture from './tincture';

export default class Charge {
  name: string;
  pluralName: string;
  chargeType: string;
  tincture: Tincture;
  SVG: string;
  tags: string[];

  constructor(name: string, pluralName: string, SVG: string, chargeType: string, tags: string[]) {
    this.name = name;
    this.pluralName = pluralName;
    this.SVG = SVG;
    this.chargeType = chargeType;
    this.tags = tags;
  }
}
