import { create } from "xmlbuilder2";
import type { ChargeGroupArrangement } from ".";
import { convertXmlToSVGObject, getSVGDimensions } from "$lib/images/svg";

export const fourChargesVerticalCenterArrangement: ChargeGroupArrangement = {
  name: "four charges vertical center",
  numberOfCharges: 4,
  blazonPattern: "four {namePlural} in pale",
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = (chargeObject as any)["svg"];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

    let scaleAmount = 1;

    if (chargeWidth > chargeHeight) {
      scaleAmount = contextWidth / chargeWidth;
    } else {
      scaleAmount = contextHeight / chargeHeight;
    }

    scaleAmount *= 0.2;

    const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));
    const chargeObject3 = JSON.parse(JSON.stringify(chargeObject));
    const chargeObject4 = JSON.parse(JSON.stringify(chargeObject));

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    const oneAndHalfHeight = newHeight * 1.5;
    const halfHeight = newHeight * 0.5;

    // 1
    svgObj["@x"] = xMove / scaleAmount;
    svgObj["@y"] = (yMove - oneAndHalfHeight) / scaleAmount;

    // 2
    chargeObject2["svg"]["@x"] = xMove / scaleAmount;
    chargeObject2["svg"]["@y"] = (yMove - halfHeight) / scaleAmount;

    // 3
    chargeObject3["svg"]["@x"] = xMove / scaleAmount;
    chargeObject3["svg"]["@y"] = (yMove + halfHeight) / scaleAmount;

    // 4
    chargeObject4["svg"]["@x"] = xMove / scaleAmount;
    chargeObject4["svg"]["@y"] = (yMove + oneAndHalfHeight) / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);
    const chargeSVG3 = create(chargeObject3);
    const chargeSVG4 = create(chargeObject4);

    const transform = `scale(${scaleAmount})`;

    return `<g transform='${transform}'>${chargeSVG1.end({ headless: true })}${chargeSVG2.end({ headless: true })}${chargeSVG3.end({ headless: true })}${chargeSVG4.end({ headless: true })}</g>`;
  },
};
