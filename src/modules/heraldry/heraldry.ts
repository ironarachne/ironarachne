"use strict";

import * as Tincture from "./tinctures";
import * as Field from "./fields";
import * as Variation from "./variations";
import * as Charge from "./charge";
import * as Charges from "./charges";
import * as Words from "../words";
import * as RND from "../random";

const _ = require("lodash");
const {create} = require("xmlbuilder2");

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
  let f = Field.random();

  let variations = [];

  let oldT = Tincture.randomWeighted();

  for (let i = 0; i < f.variationCount; i++) {
    let v = Variation.randomWeighted();
    v.tinctures = [];
    for (let j = 0; j < v.tinctureCount; j++) {
      let t = Tincture.randomWeightedExcluding(oldT);
      v.tinctures.push(t);
      oldT = t;
    }
    variations.push(v);
  }

  f.variations = variations;

  let blazon = Field.renderBlazon(f);

  let charge = Charges.random(charges);

  let numberOfCharges = randomNumberOfCharges();

  let chargePosition = "center";

  let chargeTincture = Tincture.randomContrasting(variations[0].tinctures[0]);

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

  let heraldry = {
    field: f,
    blazon: blazon,
    variations: variations,
    chargeTincture: chargeTincture,
    charge: charge,
    numberOfCharges: numberOfCharges,
    chargePosition: chargePosition,
  };

  let svg = renderSVG(heraldry, width, height);

  return {
    blazon: blazon,
    svg: svg,
  };
}

export async function loadCharges() {
  let charges = Charges.all();
  let hydratedCharges = [];

  for await (const chargeData of charges) {
    let charge = new Charge.Charge(chargeData.name, chargeData.plural, chargeData.fileName, chargeData.type);
    charge.SVG = await charge.loadSVG();
    hydratedCharges.push(charge);
  }

  return hydratedCharges;
}

export function randomNumberOfCharges() {
  let weights = [
    {item: 1, weight: 50},
    {item: 2, weight: 5},
    {item: 3, weight: 3},
  ];

  let result = RND.weighted(weights);

  return result.item;
}

export function renderSVG(heraldry: Heraldry, width: number, height: number) {
  const shieldWidth = 600;
  const shieldHeight = 660;

  let shieldSVG =
    "<path fill=\"url(#Division)\" stroke=\"#000000\" stroke-width=\"3\" d=\"M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z\"/>";

  let armsSVG =
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

  let chargeObject = create(chargeSVGString).toObject();

  let chargeWidth = chargeObject.svg["@width"];
  let chargeHeight = chargeObject.svg["@height"];

  // Begin number-of-charges logic

  let sizeAdjustment = 0.6;

  if (heraldry.numberOfCharges === 2) {
    sizeAdjustment = 0.4;
  } else if (heraldry.numberOfCharges === 3) {
    sizeAdjustment = 0.3;
  }

  let maxHeight = shieldHeight * sizeAdjustment;
  let maxWidth = shieldWidth * sizeAdjustment;

  let scaleAmount = 0;

  if (chargeWidth > chargeHeight) {
    scaleAmount = maxWidth / chargeWidth;
  } else {
    scaleAmount = maxHeight / chargeHeight;
  }

  let chargeGroup = "";

  if (heraldry.numberOfCharges === 1) {
    let xMove = (shieldWidth - chargeWidth * scaleAmount) / 2;
    let yMove = (shieldHeight - chargeHeight * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    let chargeSVG = create(chargeObject);

    let transform = "scale(" + scaleAmount + ")";

    chargeGroup =
      "<g transform='" + transform + "'>" + chargeSVG.end() + "</g>";
  } else if (heraldry.numberOfCharges === 2) {
    let chargeObject2 = _.cloneDeep(chargeObject);

    let xMove = (shieldWidth - (chargeWidth * 2 + 20) * scaleAmount) / 2;
    let yMove = (shieldHeight - chargeHeight * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    chargeObject2.svg["@x"] =
      (xMove + chargeWidth * scaleAmount) / scaleAmount + 20;
    chargeObject2.svg["@y"] = yMove / scaleAmount;

    let chargeSVG1 = create(chargeObject);
    let chargeSVG2 = create(chargeObject2);

    chargeGroup =
      "<g transform='scale(" +
      scaleAmount +
      ")'>" +
      chargeSVG1.end() +
      chargeSVG2.end() +
      "</g>";
  } else if (heraldry.numberOfCharges === 3) {
    let chargeObject2 = _.cloneDeep(chargeObject);
    let chargeObject3 = _.cloneDeep(chargeObject);

    let xMove = (shieldWidth - (chargeWidth * 2 + 50) * scaleAmount) / 2;
    let yMove = (shieldHeight - (chargeHeight * 2 + 50) * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    chargeObject2.svg["@x"] =
      (xMove + chargeWidth * scaleAmount) / scaleAmount + 50;
    chargeObject2.svg["@y"] = yMove / scaleAmount;

    chargeObject3.svg["@x"] =
      (shieldWidth - chargeWidth * scaleAmount) / 2 / scaleAmount;
    chargeObject3.svg["@y"] =
      (yMove + chargeHeight * scaleAmount) / scaleAmount + 50;

    let chargeSVG1 = create(chargeObject);
    let chargeSVG2 = create(chargeObject2);
    let chargeSVG3 = create(chargeObject3);

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
