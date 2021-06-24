import axios from "axios";

export class Charge {
  name: string;
  pluralName: string;
  fileName: string;
  chargeType: string;
  SVG: string;

  constructor(name: string, pluralName: string, fileName: string, chargeType: string) {
    this.name = name;
    this.pluralName = pluralName;
    this.fileName = fileName;
    this.chargeType = chargeType;
    this.SVG = "";
  }

  async loadSVG() {
    let svg = "";

    await axios
      .get("/images/heraldry/charges/" + this.fileName)
      .then(function (response) {
        svg = response.data;
      });

    return svg;
  }
}
