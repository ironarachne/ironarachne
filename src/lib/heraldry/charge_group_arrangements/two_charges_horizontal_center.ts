import { create } from "xmlbuilder2";
import type { ChargeGroupArrangement } from ".";
import { convertXmlToSVGObject } from "$lib/images/svg";

export const twoChargesHorizontalCenterArrangement: ChargeGroupArrangement = {
  name: "two charges horizontal center",
  numberOfCharges: 2,
  blazonPattern: "two {namePlural}",
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = (chargeObject as any)["svg"];
    const chargeWidth = Number(svgObj?.["@width"] ?? 0);
    const chargeHeight = Number(svgObj?.["@height"] ?? 0);

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

    svgObj["@x"] = (xMove - halfWidth) / scaleAmount;
    svgObj["@y"] = yMove / scaleAmount;

    chargeObject2["svg"]["@x"] = (xMove + halfWidth) / scaleAmount;
    chargeObject2["svg"]["@y"] = yMove / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);

    const transform = `scale(${scaleAmount})`;

    return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}</g>`;
  },
};
