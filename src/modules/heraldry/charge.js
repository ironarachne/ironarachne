import axios from "axios";

export class Charge {
  constructor(name, pluralName, fileName, chargeType) {
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
