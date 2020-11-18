import * as Tincture from "./tinctures.js";
import * as Field from "./fields.js";
import * as Charge from "./charges.js";
import * as Words from "../words.js";
import * as iarnd from "../random.js";
var _ = require("lodash");
const { create } = require("xmlbuilder2");

export function generate(charges) {
  let t1 = Tincture.randomWeighted();
  let t2 = Tincture.randomWeightedExcluding(t1);
  let t3 = Tincture.randomContrasting(t1);
  let tinctures = [];

  let f = Field.random();

  if (f.tinctures === 1) {
    tinctures = [t1];
  } else {
    tinctures = [t1, t2];
  }

  let blazon = Field.renderBlazon(f, tinctures);

  let charge = Charge.random(charges);

  let numberOfCharges = randomNumberOfCharges();

  let chargePosition = "center";

  if (numberOfCharges == 1) {
    blazon +=
      ", " + Words.article(charge.name) + " " + charge.name + " " + t3.name;
  } else if (numberOfCharges == 2) {
    blazon += ", two " + charge.plural + " " + t3.name;
  } else {
    blazon += ", three " + charge.plural + " " + t3.name;
  }

  let heraldry = {
    field: f,
    blazon: blazon,
    fieldTinctures: tinctures,
    chargeTincture: t3,
    charge: charge,
    numberOfCharges: numberOfCharges,
    chargePosition: chargePosition,
  };

  let svg = renderSVG(heraldry);

  return {
    blazon: blazon,
    svg: svg,
  };
}

export function getCharges() {
  let charges = Charge.all();

  return charges;
}

export function randomNumberOfCharges() {
  let weights = [
    { item: 1, weight: 50 },
    { item: 2, weight: 5 },
    { item: 3, weight: 3 },
  ];

  let result = iarnd.weighted(weights);

  return result;
}

export function renderSVG(heraldry) {
  const shieldWidth = 600;
  const shieldHeight = 660;

  let shieldSVG =
    '<path fill="#ffffff" stroke="#000000" stroke-width="3" d="M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z"/>';

  let armsSVG =
    '<svg width="600" height="660" xmlns="http://www.w3.org/2000/svg" version="1.1">';
  let defsSVG = "<defs>";

  let fieldPatternSVG = heraldry.field.pattern;

  let tincture1Fill = heraldry.fieldTinctures[0].hexColor;

  if (heraldry.fieldTinctures[0].type == "fur") {
    defsSVG += heraldry.fieldTinctures[0].pattern;
    tincture1Fill = "url(#" + heraldry.fieldTinctures[0].name + ")";
  }

  if (heraldry.field.tinctures > 1) {
    let tincture2Fill = "";
    if (heraldry.fieldTinctures[1].type == "fur") {
      defsSVG += heraldry.fieldTinctures[1].pattern;
      tincture2Fill = "url(#" + heraldry.fieldTinctures[1].name + ")";
    } else {
      tincture2Fill = heraldry.fieldTinctures[1].hexColor;
    }
    shieldSVG = shieldSVG.replaceAll("#ffffff", "url(#Division)");
    fieldPatternSVG = fieldPatternSVG.replaceAll("#ffffff", tincture1Fill);
    fieldPatternSVG = fieldPatternSVG.replaceAll("#00ff00", tincture2Fill);
    defsSVG += fieldPatternSVG;
  } else {
    shieldSVG = shieldSVG.replaceAll("#ffffff", tincture1Fill);
  }

  let tincture3Fill = heraldry.chargeTincture.hexColor;

  let chargeSVGString = heraldry.charge.svg;

  if (tincture3Fill == "#000000") {
    chargeSVGString = chargeSVGString.replaceAll("#010101", "#ffffff");
    chargeSVGString = chargeSVGString.replaceAll("#000000", "#ffffff");
  }
  chargeSVGString = chargeSVGString.replaceAll("#FFFFFF", tincture3Fill);

  let chargeObject = create(chargeSVGString).toObject();

  let chargeWidth = chargeObject.svg["@width"];
  let chargeHeight = chargeObject.svg["@height"];

  // Begin number-of-charges logic

  let sizeAdjustment = 0.6;

  if (heraldry.numberOfCharges == 2) {
    sizeAdjustment = 0.4;
  } else if (heraldry.numberOfCharges == 3) {
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

  if (heraldry.numberOfCharges == 1) {
    let xMove = (shieldWidth - chargeWidth * scaleAmount) / 2;
    let yMove = (shieldHeight - chargeHeight * scaleAmount) / 2;

    chargeObject.svg["@x"] = xMove / scaleAmount;
    chargeObject.svg["@y"] = yMove / scaleAmount;

    let chargeSVG = create(chargeObject);

    let transform = "scale(" + scaleAmount + ")";

    chargeGroup =
      "<g transform='" + transform + "'>" + chargeSVG.end() + "</g>";
  } else if (heraldry.numberOfCharges == 2) {
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
  } else if (heraldry.numberOfCharges == 3) {
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

  return svg;
}
