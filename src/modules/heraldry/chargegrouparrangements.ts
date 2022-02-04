'use strict';

import ChargeGroupArrangement from './chargegrouparrangement';
import { create } from 'xmlbuilder2';
import cloneDeep from 'lodash/cloneDeep';
import * as RND from '../random';

export function all(): ChargeGroupArrangement[] {
  return [
    new ChargeGroupArrangement('single charge center', 1, '{article} {name}', function (
      chargeSVGString: string,
      contextWidth: number,
      contextHeight: number,
    ): string {
      // contextWidth is the width of the bounding box for the entire device
      // contextHeight is the height of the bounding box for the entire device
      const chargeObject = create(chargeSVGString).toObject();
      const chargeWidth = chargeObject['svg']['@width'];
      const chargeHeight = chargeObject['svg']['@height'];

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

      chargeObject['svg']['@x'] = xMove / scaleAmount;
      chargeObject['svg']['@y'] = yMove / scaleAmount;

      const chargeSVG = create(chargeObject);

      const transform = `scale(${scaleAmount})`;

      return `<g transform="${transform}">${chargeSVG.end()}</g>`;
    }),
    new ChargeGroupArrangement('two charges horizontal center', 2, 'two {namePlural}', function (
      chargeSVGString: string,
      contextWidth: number,
      contextHeight: number,
    ): string {
      const chargeObject = create(chargeSVGString).toObject();
      const chargeWidth = chargeObject['svg']['@width'];
      const chargeHeight = chargeObject['svg']['@height'];

      let scaleAmount = 1;

      if (chargeWidth > chargeHeight) {
        scaleAmount = contextWidth / chargeWidth;
      } else {
        scaleAmount = contextHeight / chargeHeight;
      }

      scaleAmount *= 0.4;

      const chargeObject2 = cloneDeep(chargeObject);

      const newWidth = Math.floor(chargeWidth * scaleAmount);
      const newHeight = Math.floor(chargeHeight * scaleAmount);

      const xMove = (contextWidth - newWidth) / 2;
      const yMove = (contextHeight - newHeight) / 2;

      const halfWidth = newWidth / 2;

      chargeObject['svg']['@x'] = (xMove - halfWidth) / scaleAmount;
      chargeObject['svg']['@y'] = yMove / scaleAmount;

      chargeObject2['svg']['@x'] = (xMove + halfWidth) / scaleAmount;
      chargeObject2['svg']['@y'] = yMove / scaleAmount;

      const chargeSVG1 = create(chargeObject);
      const chargeSVG2 = create(chargeObject2);

      const transform = `scale(${scaleAmount})`;

      return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}</g>`;
    }),
    new ChargeGroupArrangement(
      'three charges horizontal center',
      3,
      'three {namePlural}',
      function (chargeSVGString: string, contextWidth: number, contextHeight: number): string {
        const chargeObject = create(chargeSVGString).toObject();
        const chargeWidth = chargeObject['svg']['@width'];
        const chargeHeight = chargeObject['svg']['@height'];

        let scaleAmount = 1;

        if (chargeWidth > chargeHeight) {
          scaleAmount = contextWidth / chargeWidth;
        } else {
          scaleAmount = contextHeight / chargeHeight;
        }

        scaleAmount *= 0.3;

        const chargeObject2 = cloneDeep(chargeObject);
        const chargeObject3 = cloneDeep(chargeObject);

        const newWidth = Math.floor(chargeWidth * scaleAmount);
        const newHeight = Math.floor(chargeHeight * scaleAmount);

        const xMove = (contextWidth - newWidth) / 2;
        const yMove = (contextHeight - newHeight) / 2;

        const instanceWidth = newWidth + 10;

        chargeObject['svg']['@x'] = (xMove - instanceWidth) / scaleAmount;
        chargeObject['svg']['@y'] = yMove / scaleAmount;

        chargeObject2['svg']['@x'] = xMove / scaleAmount;
        chargeObject2['svg']['@y'] = yMove / scaleAmount;

        chargeObject3['svg']['@x'] = (xMove + instanceWidth) / scaleAmount;
        chargeObject3['svg']['@y'] = yMove / scaleAmount;

        const chargeSVG1 = create(chargeObject);
        const chargeSVG2 = create(chargeObject2);
        const chargeSVG3 = create(chargeObject3);

        const transform = `scale(${scaleAmount})`;

        return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}${chargeSVG3.end()}</g>`;
      },
    ),
    new ChargeGroupArrangement('three charges vertical center', 3, 'three {namePlural}', function (
      chargeSVGString: string,
      contextWidth: number,
      contextHeight: number,
    ): string {
      const chargeObject = create(chargeSVGString).toObject();
      const chargeWidth = chargeObject['svg']['@width'];
      const chargeHeight = chargeObject['svg']['@height'];

      let scaleAmount = 1;

      if (chargeWidth > chargeHeight) {
        scaleAmount = contextWidth / chargeWidth;
      } else {
        scaleAmount = contextHeight / chargeHeight;
      }

      scaleAmount *= 0.3;

      const chargeObject2 = cloneDeep(chargeObject);
      const chargeObject3 = cloneDeep(chargeObject);

      const newWidth = Math.floor(chargeWidth * scaleAmount);
      const newHeight = Math.floor(chargeHeight * scaleAmount);

      const xMove = (contextWidth - newWidth) / 2;
      const yMove = (contextHeight - newHeight) / 2;

      const instanceHeight = newHeight + 10;

      chargeObject['svg']['@x'] = xMove / scaleAmount;
      chargeObject['svg']['@y'] = (yMove - instanceHeight) / scaleAmount;

      chargeObject2['svg']['@x'] = xMove / scaleAmount;
      chargeObject2['svg']['@y'] = yMove / scaleAmount;

      chargeObject3['svg']['@x'] = xMove / scaleAmount;
      chargeObject3['svg']['@y'] = (yMove + instanceHeight) / scaleAmount;

      const chargeSVG1 = create(chargeObject);
      const chargeSVG2 = create(chargeObject2);
      const chargeSVG3 = create(chargeObject3);

      const transform = `scale(${scaleAmount})`;

      return `<g transform='${transform}'>${chargeSVG1.end()}${chargeSVG2.end()}${chargeSVG3.end()}</g>`;
    }),
  ];
}

export function byName(name: string): ChargeGroupArrangement {
  let options = all();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }

  console.error(`failed to find a charge group arrangement with name "${name}"`);
}

export function randomByNumber(numberOfCharges: number): ChargeGroupArrangement {
  const allArrangements = all();

  let options = [];

  for (let i = 0; i < allArrangements.length; i++) {
    if (allArrangements[i].numberOfCharges == numberOfCharges) {
      options.push(allArrangements[i]);
    }
  }

  return RND.item(options);
}
