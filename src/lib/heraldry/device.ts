import * as Words from "@ironarachne/words";
import ChargeGroup from "./chargegroup.js";
import Field from "./field.js";

export default class Device {
  field: Field;
  chargeGroups: ChargeGroup[];

  constructor(field: Field, chargeGroups: ChargeGroup[]) {
    this.field = field;
    this.chargeGroups = chargeGroups;
  }

  renderBlazon(): string {
    let chargeGroupBlazons = [];

    for (let i = 0; i < this.chargeGroups.length; i++) {
      chargeGroupBlazons.push(this.chargeGroups[i].renderBlazon());
    }

    let blazon = this.field.renderBlazon();

    if (this.chargeGroups.length > 0) {
      blazon += ", " + Words.arrayToPhrase(chargeGroupBlazons);
    }

    return blazon;
  }
}
