import type { ChargeGroupArrangement } from '.';
import { create } from 'xmlbuilder2';
import { convertXmlToSVGObject, getSVGDimensions } from '$lib/images/svg';

export const singleChargeCenterArrangement: ChargeGroupArrangement = {
  name: 'single charge center',
  numberOfCharges: 1,
  blazonPattern: '{article} {name}',
  renderSVG: function (
    chargeSVGString: string,
    contextWidth: number,
    contextHeight: number,
  ): string {
    // contextWidth is the width of the bounding box for the entire device
    // contextHeight is the height of the bounding box for the entire device
    const chargeObject = convertXmlToSVGObject(chargeSVGString);
    const svgObj = (chargeObject as any)['svg'];
    const { width: chargeWidth, height: chargeHeight } = getSVGDimensions(svgObj);

    let scaleAmount = Math.min(contextWidth / chargeWidth, contextHeight / chargeHeight);

    scaleAmount *= 0.75;

    const newWidth = Math.floor(chargeWidth * scaleAmount);
    const newHeight = Math.floor(chargeHeight * scaleAmount);

    const xMove = (contextWidth - newWidth) / 2;
    const yMove = (contextHeight - newHeight) / 2;

    svgObj['@x'] = xMove / scaleAmount;
    svgObj['@y'] = yMove / scaleAmount;

    const chargeSVG = create(chargeObject);

    const transform = `scale(${scaleAmount})`;

    return `<g transform="${transform}">${chargeSVG.end({ headless: true })}</g>`;
  },
};
