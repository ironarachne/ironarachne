import type Tincture from "./tincture.js";

export default class Variation {
  name: string;
  tinctureCount: number;
  blazon: string;
  pattern: string;
  supportsFurs: boolean;
  commonality: number;
  tinctures: Tincture[];

  constructor(
    name: string,
    tinctureCount: number,
    blazon: string,
    pattern: string,
    supportsFurs: boolean,
    commonality: number,
  ) {
    this.name = name;
    this.tinctureCount = tinctureCount;
    this.blazon = blazon;
    this.pattern = pattern;
    this.supportsFurs = supportsFurs;
    this.commonality = commonality;
    this.tinctures = [];
  }

  renderBlazon(): string {
    let blazon = this.blazon;

    blazon = blazon.replace("tincture1", this.tinctures[0].name);

    if (this.tinctures.length > 1) {
      blazon = blazon.replace("tincture2", this.tinctures[1].name);
    }

    return blazon;
  }

  renderSVGPattern(): string {
    let svg = this.pattern;

    svg = svg.replaceAll("tincture1", "url(#" + this.tinctures[0].name + ")");

    if (this.tinctureCount > 1) {
      svg = svg.replaceAll("tincture2", "url(#" + this.tinctures[1].name + ")");
    }

    return svg;
  }
}
