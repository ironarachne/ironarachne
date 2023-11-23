import * as RND from "@ironarachne/rng";
import { convert, create } from "xmlbuilder2";
import type ChargeGroupArrangement from "./charge_group_arrangement.js";

function xmlToChargeObject(xml: string) {
  const xmlObject = convert(xml, { format: "object" });

  return xmlObject;
}

export function all(): ChargeGroupArrangement[] {
  return [
    {
      name: "single charge center",
      numberOfCharges: 1,
      blazonPattern: "{article} {name}",
      renderSVG: function(
        chargeSVGString: string,
        contextWidth: number,
        contextHeight: number,
      ): string {
        // contextWidth is the width of the bounding box for the entire device
        // contextHeight is the height of the bounding box for the entire device
        const chargeObject = xmlToChargeObject(chargeSVGString);
        const chargeWidth = chargeObject["svg"]["@width"];
        const chargeHeight = chargeObject["svg"]["@height"];

        // if charge height is bigger than width, set the new height equal to the bounding box height
        // if charge width is bigger than height, set the new width equal to the bounding box width, and the height equal to bounding box height times aspect ratio

        // if height is bigger, set scale amount to bb height / charge height
        // if width is bigger, set scale amount to bb width / charge width

        let scaleAmount = 1;

        if (chargeWidth > chargeHeight) {
          scaleAmount = contextWidth / chargeWidth;
        } else {
          scaleAmount = contextHeight / chargeHeight;
        }

        scaleAmount *= 0.6;

        const newWidth = Math.floor(chargeWidth * scaleAmount);
        const newHeight = Math.floor(chargeHeight * scaleAmount);

        const xMove = (contextWidth - newWidth) / 2;
        const yMove = (contextHeight - newHeight) / 2;

        chargeObject["svg"]["@x"] = xMove / scaleAmount;
        chargeObject["svg"]["@y"] = yMove / scaleAmount;

        const chargeSVG = create(chargeObject);

        const transform = `scale(${scaleAmount})`;

        return `<g transform="${transform}">${chargeSVG.end()}</g>`;
      },
    },
    {
      name: "two charges horizontal center",
      numberOfCharges: 2,
      blazonPattern: "two {namePlural}",
      renderSVG: function(
        chargeSVGString: string,
        contextWidth: number,
        contextHeight: number,
      ): string {
        const chargeObject = xmlToChargeObject(chargeSVGString);
        const chargeWidth = chargeObject["svg"]["@width"];
        const chargeHeight = chargeObject["svg"]["@height"];

        let scaleAmount = 1;

        if (chargeWidth > chargeHeight) {
          scaleAmount = contextWidth / chargeWidth;
        } else {
          scaleAmount = contextHeight / chargeHeight;
        }

        scaleAmount *= 0.4;

        const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));

        const newWidth = Math.floor(chargeWidth * scaleAmount);
        const newHeight = Math.floor(chargeHeight * scaleAmount);

        const xMove = (contextWidth - newWidth) / 2;
        const yMove = (contextHeight - newHeight) / 2;

        const halfWidth = newWidth / 2;

        chargeObject["svg"]["@x"] = (xMove - halfWidth) / scaleAmount;
        chargeObject["svg"]["@y"] = yMove / scaleAmount;

        chargeObject2["svg"]["@x"] = (xMove + halfWidth) / scaleAmount;
        chargeObject2["svg"]["@y"] = yMove / scaleAmount;

        const chargeSVG1 = create(chargeObject);
        const chargeSVG2 = create(chargeObject2);

        const transform = `scale(${scaleAmount})`;

        return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}</g>`;
      },
    },
    {
      name: "three charges horizontal center",
      numberOfCharges: 3,
      blazonPattern: "three {namePlural}",
      renderSVG: function(chargeSVGString: string, contextWidth: number, contextHeight: number): string {
        const chargeObject = xmlToChargeObject(chargeSVGString);
        const chargeWidth = chargeObject["svg"]["@width"];
        const chargeHeight = chargeObject["svg"]["@height"];

        let scaleAmount = 1;

        if (chargeWidth > chargeHeight) {
          scaleAmount = contextWidth / chargeWidth;
        } else {
          scaleAmount = contextHeight / chargeHeight;
        }

        scaleAmount *= 0.3;

        const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));
        const chargeObject3 = JSON.parse(JSON.stringify(chargeObject));

        const newWidth = Math.floor(chargeWidth * scaleAmount);
        const newHeight = Math.floor(chargeHeight * scaleAmount);

        const xMove = (contextWidth - newWidth) / 2;
        const yMove = (contextHeight - newHeight) / 2;

        const instanceWidth = newWidth + 10;

        chargeObject["svg"]["@x"] = (xMove - instanceWidth) / scaleAmount;
        chargeObject["svg"]["@y"] = yMove / scaleAmount;

        chargeObject2["svg"]["@x"] = xMove / scaleAmount;
        chargeObject2["svg"]["@y"] = yMove / scaleAmount;

        chargeObject3["svg"]["@x"] = (xMove + instanceWidth) / scaleAmount;
        chargeObject3["svg"]["@y"] = yMove / scaleAmount;

        const chargeSVG1 = create(chargeObject);
        const chargeSVG2 = create(chargeObject2);
        const chargeSVG3 = create(chargeObject3);

        const transform = `scale(${scaleAmount})`;

        return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}${chargeSVG3.end()}</g>`;
      },
    },
    {
      name: "three charges vertical center",
      numberOfCharges: 3,
      blazonPattern: "three {namePlural}",
      renderSVG: function(
        chargeSVGString: string,
        contextWidth: number,
        contextHeight: number,
      ): string {
        const chargeObject = xmlToChargeObject(chargeSVGString);
        const chargeWidth = chargeObject["svg"]["@width"];
        const chargeHeight = chargeObject["svg"]["@height"];

        let scaleAmount = 1;

        if (chargeWidth > chargeHeight) {
          scaleAmount = contextWidth / chargeWidth;
        } else {
          scaleAmount = contextHeight / chargeHeight;
        }

        scaleAmount *= 0.3;

        const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));
        const chargeObject3 = JSON.parse(JSON.stringify(chargeObject));

        const newWidth = Math.floor(chargeWidth * scaleAmount);
        const newHeight = Math.floor(chargeHeight * scaleAmount);

        const xMove = (contextWidth - newWidth) / 2;
        const yMove = (contextHeight - newHeight) / 2;

        const instanceHeight = newHeight + 10;

        chargeObject["svg"]["@x"] = xMove / scaleAmount;
        chargeObject["svg"]["@y"] = (yMove - instanceHeight) / scaleAmount;

        chargeObject2["svg"]["@x"] = xMove / scaleAmount;
        chargeObject2["svg"]["@y"] = yMove / scaleAmount;

        chargeObject3["svg"]["@x"] = xMove / scaleAmount;
        chargeObject3["svg"]["@y"] = (yMove + instanceHeight) / scaleAmount;

        const chargeSVG1 = create(chargeObject);
        const chargeSVG2 = create(chargeObject2);
        const chargeSVG3 = create(chargeObject3);

        const transform = `scale(${scaleAmount})`;

        return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}${chargeSVG3.end()}</g>`;
      },
    },
  ];
}

export function byName(name: string): ChargeGroupArrangement {
  let options = all();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }

  throw new Error(`failed to find a charge group arrangement with name "${name}"`);
}

export function randomByNumber(numberOfCharges: number): ChargeGroupArrangement {
  const allArrangements = all();

  let options = [];

  for (let i = 0; i < allArrangements.length; i++) {
    if (allArrangements[i].numberOfCharges == numberOfCharges) {
      options.push(allArrangements[i]);
    }
  }

  if (options.length === 0) {
    throw new Error(`failed to find a charge group arrangement with ${numberOfCharges} charges`);
  }

  return RND.item(options);
}

export function withCount(count: number): ChargeGroupArrangement[] {
  const options = all();

  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].numberOfCharges == count) {
      result.push(options[i]);
    }
  }

  return result;
}
