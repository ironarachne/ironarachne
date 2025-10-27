import * as Words from "@ironarachne/words";
import type { Charge } from "./charges/index";
import type { ChargeGroupArrangement } from "./charge_group_arrangements/index.js";

export type ChargeGroup = {
  charge: Charge;
  numberOfCharges: number;
  arrangement: ChargeGroupArrangement;
};

export function renderChargeGroupBlazon(group: ChargeGroup): string {
  let blazon = group.arrangement.blazonPattern;
  blazon = blazon.replaceAll("{article}", Words.article(group.charge.name));
  blazon = blazon.replaceAll("{name}", group.charge.name);
  blazon = blazon.replaceAll("{namePlural}", group.charge.pluralName);
  blazon += ` ${group.charge.tincture.name}`;
  return blazon;
}

export function renderChargeGroupSVG(group: ChargeGroup, contextWidth: number, contextHeight: number): string {
  let chargeSVGString = group.charge.SVG;
  chargeSVGString = setChargeColor(
    group.charge.tincture.hexColor,
    group.charge.tincture.name,
    chargeSVGString,
  );
  return group.arrangement.renderSVG(
    chargeSVGString,
    contextWidth,
    contextHeight,
  );
}

function setChargeColor(
  hexColor: string,
  tinctureName: string,
  chargeSVG: string,
): string {
  let svgResult = chargeSVG;

  if (hexColor === "#000000") {
    svgResult = svgResult.replaceAll("#010101", "#ffffff");
    svgResult = svgResult.replaceAll("#000000", "#ffffff");
  }

  svgResult = svgResult.replaceAll("#FFFFFF", hexColor);

  svgResult = svgResult.replaceAll('st0', `st0-${tinctureName}`);
  svgResult = svgResult.replaceAll('st1', `st1-${tinctureName}`);

  // TODO: Fix a bug where the border is colored if the charge color is sable

  return svgResult;
}
