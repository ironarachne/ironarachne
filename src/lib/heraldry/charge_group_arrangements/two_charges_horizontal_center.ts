import { create } from 'xmlbuilder2';
import type { ChargeGroupArrangement } from '.';
import { convertXmlToSVGObject, getSVGDimensions } from '$lib/images/svg';

export const twoChargesHorizontalCenterArrangement: ChargeGroupArrangement = {
  name: 'two charges horizontal center',
  numberOfCharges: 2,
  blazonPattern: 'two {namePlural}',
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = chargeObject['svg'];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

    let scaleAmount = Math.min(contextWidth / (chargeWidth * 2), contextHeight / chargeHeight);

    scaleAmount *= 0.9;

    const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    const halfWidth = newWidth / 2;

    svgObj['@x'] = (xMove - halfWidth) / scaleAmount;
    svgObj['@y'] = yMove / scaleAmount;

    chargeObject2['svg']['@x'] = (xMove + halfWidth) / scaleAmount;
    chargeObject2['svg']['@y'] = yMove / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);

    const transform = `scale(${scaleAmount})`;

    return `<g transform='${transform}'>${chargeSVG1.end({ headless: true })}${chargeSVG2.end({ headless: true })}</g>`;
  },
};
