"use strict";

import Coordinate from "../coordinate";
import Charge from "./charge";
import * as Words from "../words";
import ChargeGroupArrangement from "./chargegrouparrangement";

export default class ChargeGroup {
  charge: Charge;
  numberOfCharges: number;
  arrangement: ChargeGroupArrangement;

  constructor(charge: Charge, numberOfCharges: number, arrangement: ChargeGroupArrangement) {
    this.charge = charge;
    this.numberOfCharges = numberOfCharges;
    this.arrangement = arrangement;
  }

  renderBlazon(): string {
    let blazon = this.arrangement.blazonPattern;

    blazon = blazon.replaceAll('{article}', Words.article(this.charge.name));
    blazon = blazon.replaceAll('{name}', this.charge.name);
    blazon = blazon.replaceAll('{namePlural}', this.charge.pluralName);

    blazon += ` ${this.charge.tincture.name}`;

    return blazon;
  }

  renderSVG(contextWidth: number, contextHeight: number): string {
    let chargeGroup = '';

    let chargeSVGString = this.charge.SVG;

    chargeSVGString = setChargeColor(this.charge.tincture.hexColor, chargeSVGString);
    chargeGroup = this.arrangement.renderSVG(chargeSVGString, contextWidth, contextHeight);

    return chargeGroup;
  }
}

function setChargeColor(hexColor: string, chargeSVG: string): string {
  if (hexColor === "#000000") {
    chargeSVG = chargeSVG.replaceAll("#010101", "#ffffff");
    chargeSVG = chargeSVG.replaceAll("#000000", "#ffffff");
  }

  chargeSVG = chargeSVG.replaceAll("#FFFFFF", hexColor);

  return chargeSVG;
}
