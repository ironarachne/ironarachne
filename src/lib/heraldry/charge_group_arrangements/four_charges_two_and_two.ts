import { create } from 'xmlbuilder2';
import type { ChargeGroupArrangement } from '.';
import { convertXmlToSVGObject, getSVGDimensions } from '$lib/images';

export const fourChargesTwoAndTwoArrangement: ChargeGroupArrangement = {
  name: 'four charges two and two',
  numberOfCharges: 4,
  blazonPattern: 'four {namePlural} two and two',
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = chargeObject['svg'];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

    let scaleAmount = Math.min(
      contextWidth / (chargeWidth * 2),
      contextHeight / (chargeHeight * 2),
    );

    scaleAmount *= 0.9;

    const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));
    const chargeObject3 = JSON.parse(JSON.stringify(chargeObject));
    const chargeObject4 = JSON.parse(JSON.stringify(chargeObject));

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    const halfWidth = newWidth / 2;
    const halfHeight = newHeight / 2;

    // Top Left
    svgObj['@x'] = (xMove - halfWidth) / scaleAmount;
    svgObj['@y'] = (yMove - halfHeight) / scaleAmount;

    // Top Right
    chargeObject2['svg']['@x'] = (xMove + halfWidth) / scaleAmount;
    chargeObject2['svg']['@y'] = (yMove - halfHeight) / scaleAmount;

    // Bottom Left
    chargeObject3['svg']['@x'] = (xMove - halfWidth) / scaleAmount;
    chargeObject3['svg']['@y'] = (yMove + halfHeight) / scaleAmount;

    // Bottom Right
    chargeObject4['svg']['@x'] = (xMove + halfWidth) / scaleAmount;
    chargeObject4['svg']['@y'] = (yMove + halfHeight) / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);
    const chargeSVG3 = create(chargeObject3);
    const chargeSVG4 = create(chargeObject4);

    const transform = `scale(${scaleAmount})`;

    return `<g transform='${transform}'>${chargeSVG1.end({ headless: true })}${chargeSVG2.end({ headless: true })}${chargeSVG3.end({ headless: true })}${chargeSVG4.end({ headless: true })}</g>`;
  },
};
