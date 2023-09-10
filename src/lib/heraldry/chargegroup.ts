import * as Words from "@ironarachne/words";
import Charge from "./charge.js";
import ChargeGroupArrangement from "./chargegrouparrangement.js";

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

    blazon = blazon.replaceAll("{article}", Words.article(this.charge.name));
    blazon = blazon.replaceAll("{name}", this.charge.name);
    blazon = blazon.replaceAll("{namePlural}", this.charge.pluralName);

    blazon += ` ${this.charge.tincture.name}`;

    return blazon;
  }

  renderSVG(contextWidth: number, contextHeight: number): string {
    let chargeGroup = "";

    let chargeSVGString = this.charge.SVG;

    chargeSVGString = setChargeColor(
      this.charge.tincture.hexColor,
      this.charge.tincture.name,
      chargeSVGString,
    );
    chargeGroup = this.arrangement.renderSVG(chargeSVGString, contextWidth, contextHeight);

    return chargeGroup;
  }
}

function setChargeColor(hexColor: string, tinctureName: string, chargeSVG: string): string {
  if (hexColor === "#000000") {
    chargeSVG = chargeSVG.replaceAll("#010101", "#ffffff");
    chargeSVG = chargeSVG.replaceAll("#000000", "#ffffff");
  }

  chargeSVG = chargeSVG.replaceAll("#FFFFFF", hexColor);

  chargeSVG = chargeSVG.replaceAll(`st0`, `st0-${tinctureName}`);
  chargeSVG = chargeSVG.replaceAll(`st1`, `st1-${tinctureName}`);

  // TODO: Fix a bug where the border is colored if the charge color is sable

  return chargeSVG;
}
