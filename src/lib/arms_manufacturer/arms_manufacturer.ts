import type { Weapon } from '$lib/weapons';

export type ArmsManufacturer = {
  name: string;
  description: string;
  models: Weapon[];
};
