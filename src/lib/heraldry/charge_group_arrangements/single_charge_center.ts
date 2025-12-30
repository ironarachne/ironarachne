import type { ChargeGroupArrangement } from ".";
import { create } from "xmlbuilder2";
import { convertXmlToSVGObject, getSVGDimensions } from "$lib/images/svg";

export const singleChargeCenterArrangement: ChargeGroupArrangement = {
  name: "single charge center",
  numberOfCharges: 1,
  blazonPattern: "{article} {name}",
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    // contextWidth is the width of the bounding box for the entire device
    // contextHeight is the height of the bounding box for the entire device
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = (chargeObject as any)["svg"];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

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

    scaleAmount *= 0.75;

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    svgObj["@x"] = xMove / scaleAmount;
    svgObj["@y"] = yMove / scaleAmount;

    const chargeSVG = create(chargeObject);

    const transform = `scale(${scaleAmount})`;

    return `<g transform="${transform}">${chargeSVG.end({ headless: true })}</g>`;
  },
};
