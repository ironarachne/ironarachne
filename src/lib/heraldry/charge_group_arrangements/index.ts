import * as RNG from '@ironarachne/rng';
import { convert } from 'xmlbuilder2';
import { fourChargesHorizontalCenterArrangement } from './four_charges_horizontal_center';
import { fourChargesTwoAndTwoArrangement } from './four_charges_two_and_two';
import { fourChargesVerticalCenterArrangement } from './four_charges_vertical_center';
import { singleChargeCenterArrangement } from './single_charge_center';
import { threeChargesHorizontalCenterArrangement } from './three_charges_horizontal_center';
import { threeChargesTwoAndOneArrangement } from './three_charges_two_and_one';
import { threeChargesVerticalCenterArrangement } from './three_charges_vertical_center';
import { twoChargesHorizontalCenterArrangement } from './two_charges_horizontal_center';

export type ChargeGroupArrangement = {
  name: string;
  numberOfCharges: number;
  blazonPattern: string;
  renderSVG: (chargeSVGString: string, contextWidth: number, contextHeight: number) => string;
};

export function getAllChargeArrangements(): ChargeGroupArrangement[] {
  return [
    fourChargesHorizontalCenterArrangement,
    fourChargesTwoAndTwoArrangement,
    fourChargesVerticalCenterArrangement,
    singleChargeCenterArrangement,
    threeChargesHorizontalCenterArrangement,
    threeChargesTwoAndOneArrangement,
    threeChargesVerticalCenterArrangement,
    twoChargesHorizontalCenterArrangement,
  ];
}

export function byName(name: string): ChargeGroupArrangement {
  let options = getAllChargeArrangements();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name === name) {
      return options[i];
    }
  }

  throw new Error(`failed to find a charge group arrangement with name "${name}"`);
}

export function randomByNumber(numberOfCharges: number): ChargeGroupArrangement {
  const allArrangements = getAllChargeArrangements();

  let options = [];

  for (let i = 0; i < allArrangements.length; i++) {
    if (allArrangements[i].numberOfCharges === numberOfCharges) {
      options.push(allArrangements[i]);
    }
  }

  if (options.length === 0) {
    throw new Error(`failed to find a charge group arrangement with ${numberOfCharges} charges`);
  }

  return RNG.item(options);
}

export function withCount(count: number): ChargeGroupArrangement[] {
  const options = getAllChargeArrangements();

  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].numberOfCharges === count) {
      result.push(options[i]);
    }
  }

  return result;
}
