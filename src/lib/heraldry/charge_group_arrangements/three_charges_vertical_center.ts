import { create } from 'xmlbuilder2';
import type { ChargeGroupArrangement } from '.';
import { convertXmlToSVGObject, getSVGDimensions } from '$lib/images/svg';

export const threeChargesVerticalCenterArrangement: ChargeGroupArrangement = {
  name: 'three charges vertical center',
  numberOfCharges: 3,
  blazonPattern: 'three {namePlural}',
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = (chargeObject as any)['svg'];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

    let scaleAmount = Math.min(contextWidth / chargeWidth, contextHeight / (chargeHeight * 3));

    scaleAmount *= 0.9;

    const chargeObject2 = JSON.parse(JSON.stringify(chargeObject));
    const chargeObject3 = JSON.parse(JSON.stringify(chargeObject));

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    const instanceHeight = newHeight + 10;

    svgObj['@x'] = xMove / scaleAmount;
    svgObj['@y'] = (yMove - instanceHeight) / scaleAmount;

    chargeObject2['svg']['@x'] = xMove / scaleAmount;
    chargeObject2['svg']['@y'] = yMove / scaleAmount;

    chargeObject3['svg']['@x'] = xMove / scaleAmount;
    chargeObject3['svg']['@y'] = (yMove + instanceHeight) / scaleAmount;

    const chargeSVG1 = create(chargeObject);
    const chargeSVG2 = create(chargeObject2);
    const chargeSVG3 = create(chargeObject3);

    const transform = `scale(${scaleAmount})`;

    return `<g transform='${transform}'>${chargeSVG1.end({ headless: true })}${chargeSVG2.end({ headless: true })}${chargeSVG3.end({ headless: true })}</g>`;
  },
};
