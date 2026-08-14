import * as Words from '@ironarachne/words';
import { tintChargeSvg } from '$lib/charges';
import type { Charge } from './charge_heraldry.js';
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
  chargeSVGString = tintChargeSvg(
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
