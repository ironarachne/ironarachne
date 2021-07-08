export class Charge {
  name: string;
  pluralName: string;
  chargeType: string;
  SVG: string;

  constructor(name: string, pluralName: string, SVG: string, chargeType: string) {
    this.name = name;
    this.pluralName = pluralName;
    this.SVG = SVG;
    this.chargeType = chargeType;
  }
}
