"use strict";

import * as Tincture from "./tinctures";
import * as Field from "./fields";
import * as Variation from "./variations";
import * as Charge from "./charge";
import * as Charges from "./charges";
import * as Words from "../words";
import * as RND from "../random";

import * as _ from "lodash";
import {create} from "xmlbuilder2";

export class Heraldry {
  field: Field.Field;
  blazon: string;
  variations: Variation.Variation[];
  chargeTincture: Tincture.Tincture;
  charge: Charge.Charge;
  numberOfCharges: number;
  chargePosition: string;

  constructor(field: Field.Field, blazon: string, variations: Variation.Variation[], chargeTincture: Tincture.Tincture, charge: Charge.Charge, numberOfCharges: number, chargePosition: string) {
    this.field = field;
    this.blazon = blazon;
    this.variations = variations;
    this.chargeTincture = chargeTincture;
    this.charge = charge;
    this.numberOfCharges = numberOfCharges;
    this.chargePosition = chargePosition;
  }
}

export function generate(charges: Charge.Charge[], width: number, height: number) {
  const f = Field.random();

  const variations = [];

  let oldT = Tincture.randomWeighted();

  for (let i = 0; i < f.variationCount; i++) {
    const v = Variation.randomWeighted();
    v.tinctures = [];
    for (let j = 0; j < v.tinctureCount; j++) {
      const t = Tincture.randomWeightedExcluding(oldT);
      v.tinctures.push(t);
      oldT = t;
    }
    variations.push(v);
  }

  f.variations = variations;

  let blazon = Field.renderBlazon(f);

  const charge = Charges.random(charges);

  const numberOfCharges = randomNumberOfCharges();

  const chargePosition = "center";

  const chargeTincture = Tincture.randomContrasting(variations[0].tinctures[0]);

  if (numberOfCharges === 1) {
    blazon +=
      ", " +
      Words.article(charge.name) +
      " " +
      charge.name +
      " " +
      chargeTincture.name;
  } else if (numberOfCharges === 2) {
    blazon += ", two " + charge.plural + " " + chargeTincture.name;
  } else {
    blazon += ", three " + charge.plural + " " + chargeTincture.name;
  }

  const heraldry = new Heraldry(
    f,
    blazon,
    variations,
    chargeTincture,
    charge,
    numberOfCharges,
    chargePosition,
  );

  const svg = renderSVG(heraldry, width, height);

  return {
    blazon: blazon,
    svg: svg,
  };
}

export function randomNumberOfCharges() {
  const weights = [
    {item: 1, weight: 50},
    {item: 2, weight: 5},
    {item: 3, weight: 3},
  ];

  const result = RND.weighted(weights);

  return result.item;
}

export function renderSVG(heraldry: Heraldry, width: number, height: number) {
  const shieldWidth = 600;
  const shieldHeight = 660;

  const shieldSVG =
    "<path fill=\"url(#Division)\" stroke=\"#000000\" stroke-width=\"3\" d=\"M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z\"/>";

  const armsSVG =
    "<svg width=\"" + width + "\" height=\"" + height + "\" viewBox=\"0 0 " + shieldWidth + " " + shieldHeight + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">";
  let defsSVG = "<defs>";

  defsSVG += heraldry.field.pattern;

  for (let i = 0; i < heraldry.variations.length; i++) {
    for (let j = 0; j < heraldry.variations[i].tinctures.length; j++) {
      defsSVG += heraldry.variations[i].tinctures[j].pattern;
    }
    let pattern = Variation.renderSVGPattern(heraldry.variations[i]);
    pattern = pattern.replaceAll("variation", "variation" + (i + 1));
    defsSVG += pattern;
  }

  let chargeSVGString = heraldry.charge.SVG;

  if (heraldry.chargeTincture.hexColor === "#000000") {
    chargeSVGString = chargeSVGString.replaceAll("#010101", "#ffffff");
    chargeSVGString = chargeSVGString.replaceAll("#000000", "#ffffff");
  }
  chargeSVGString = chargeSVGString.replaceAll(
    "#FFFFFF",
    heraldry.chargeTincture.hexColor
  );

  const chargeObject = create(chargeSVGString).toObject();

  const chargeWidth = chargeObject.svg["@width"];
  const chargeHeight = chargeObject.svg["@height"];

  // Begin number-of-charges logic

  let sizeAdjustment = 0.6;

  if (heraldry.numberOfCharges === 2) {
    sizeAdjustment = 0.4;
  } else if (heraldry.numberOfCharges === 3) {
    sizeAdjustment = 0.3;
  }

  const maxHeight = shieldHeight * sizeAdjustment;
  const maxWidth = shieldWidth * sizeAdjustment;

  let scaleAmount = 0;

  if (chargeWidth > chargeHeight) {
    scaleAmount = maxWidth / chargeWidth;
  } else {
    scaleAmount = maxHeight / chargeHeight;
  }

  let chargeGroup = "";

  if (heraldry.numberOfCharges === 1) {
    const xMove = (shieldWidth - chargeWidth * scaleAmount) / 2;
    const yMove = (shieldHeight - chargeHeight * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    const chargeSVG = create(chargeObject);

    const transform = "scale(" + scaleAmount + ")";

    chargeGroup =
      "<g transform='" + transform + "'>" + chargeSVG.end() + "</g>";
  } else if (heraldry.numberOfCharges === 2) {
    const chargeObject2 = _.cloneDeep(chargeObject);

    const xMove = (shieldWidth - (chargeWidth * 2 + 20) * scaleAmount) / 2;
    const yMove = (shieldHeight - chargeHeight * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    chargeObject2.svg["@x"] =
      (xMove + chargeWidth * scaleAmount) / scaleAmount + 20;
    chargeObject2.svg["@y"] = yMove / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);

    chargeGroup =
      "<g transform='scale(" +
      scaleAmount +
      ")'>" +
      chargeSVG1.end() +
      chargeSVG2.end() +
      "</g>";
  } else if (heraldry.numberOfCharges === 3) {
    const chargeObject2 = _.cloneDeep(chargeObject);
    const chargeObject3 = _.cloneDeep(chargeObject);

    const xMove = (shieldWidth - (chargeWidth * 2 + 50) * scaleAmount) / 2;
    const yMove = (shieldHeight - (chargeHeight * 2 + 50) * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    chargeObject2.svg["@x"] =
      (xMove + chargeWidth * scaleAmount) / scaleAmount + 50;
    chargeObject2.svg["@y"] = yMove / scaleAmount;

    chargeObject3.svg["@x"] =
      (shieldWidth - chargeWidth * scaleAmount) / 2 / scaleAmount;
    chargeObject3.svg["@y"] =
      (yMove + chargeHeight * scaleAmount) / scaleAmount + 50;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);
    const chargeSVG3 = create(chargeObject3);

    chargeGroup =
      "<g transform='scale(" +
      scaleAmount +
      ")'>" +
      chargeSVG1.end() +
      chargeSVG2.end() +
      chargeSVG3.end() +
      "</g>";
  }

  let svg = armsSVG;

  svg += defsSVG + "</defs>";
  svg += shieldSVG;
  svg += chargeGroup;
  svg += "</svg>";

  return svg.replace(/<\?xml.*\?>/g, "");
}
