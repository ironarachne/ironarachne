import * as Words from '@ironarachne/words';
import type { ChargeGroup } from './charge_group.js';
import { renderChargeGroupBlazon } from './charge_group.js';
import type { Field } from './field.js';
import { renderFieldBlazon } from './field.js';

export type Device = {
  field: Field;
  chargeGroups: ChargeGroup[];
};

export function renderDeviceBlazon(device: Device): string {
  const chargeGroupBlazons = device.chargeGroups.map((cg) => renderChargeGroupBlazon(cg));
  let blazon = renderFieldBlazon(device.field);
  if (device.chargeGroups.length > 0) {
    blazon += `, ${Words.arrayToPhrase(chargeGroupBlazons)}`;
  }
  return blazon;
}
