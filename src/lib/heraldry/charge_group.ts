import * as Words from '@ironarachne/words';
import type { Charge } from './charges/index';
import type { ChargeGroupArrangement } from './charge_group_arrangements/index.js';

export type ChargeGroup = {
  charge: Charge;
  numberOfCharges: number;
  arrangement: ChargeGroupArrangement;
  position?: string;
};

export function renderChargeGroupBlazon(group: ChargeGroup): string {
  let blazon = group.arrangement.blazonPattern;
  blazon = blazon.replaceAll('{article}', Words.article(group.charge.name));
  blazon = blazon.replaceAll('{name}', group.charge.name);
  blazon = blazon.replaceAll('{namePlural}', group.charge.pluralName);
  blazon += ` ${group.charge.tincture.name}`;
  if (group.position) {
    blazon += ` ${group.position}`;
  }
  return blazon;
}

export function renderChargeGroupSVG(
  group: ChargeGroup,
  contextWidth: number,
  contextHeight: number,
): string {
  let chargeSVGString = group.charge.SVG;
  chargeSVGString = setChargeColor(
    group.charge.tincture.hexColor,
    group.charge.tincture.name,
    chargeSVGString,
  );

  let renderHeight = contextHeight;

  if (group.position === 'in chief') {
    const chiefHeight = contextHeight / 3;
    renderHeight = contextHeight / 2;
    const result = group.arrangement.renderSVG(chargeSVGString, contextWidth, renderHeight);

    const dy = chiefHeight / 2 - renderHeight / 2;
    return `<g transform="translate(0, ${dy})">${result}</g>`;
  }

  return group.arrangement.renderSVG(chargeSVGString, contextWidth, renderHeight);
}

function setChargeColor(hexColor: string, tinctureName: string, chargeSVG: string): string {
  let svgResult = chargeSVG;

  if (hexColor === '#000000') {
    svgResult = svgResult.replaceAll('#FFFFFF', hexColor);
    svgResult = svgResult.replaceAll('#ffffff', hexColor);
    svgResult = svgResult.replaceAll('fill="white"', `fill="${hexColor}"`);
  } else {
    svgResult = svgResult.replaceAll('#010101', 'TEMP_CHARGE_FILL_PLACEHOLDER');
    svgResult = svgResult.replaceAll('#000000', 'TEMP_CHARGE_FILL_PLACEHOLDER');
    svgResult = svgResult.replaceAll('fill="black"', 'fill="TEMP_CHARGE_FILL_PLACEHOLDER"');
    svgResult = svgResult.replaceAll('#FFFFFF', hexColor);
    svgResult = svgResult.replaceAll('#ffffff', hexColor);
    svgResult = svgResult.replaceAll('fill="white"', `fill="${hexColor}"`);
    svgResult = svgResult.replaceAll('TEMP_CHARGE_FILL_PLACEHOLDER', hexColor);
  }

  svgResult = svgResult.replaceAll('st0', `st0-${tinctureName}`);
  svgResult = svgResult.replaceAll('st1', `st1-${tinctureName}`);

  return svgResult;
}
