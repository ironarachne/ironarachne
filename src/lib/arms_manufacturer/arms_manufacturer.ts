import type { Weapon } from '$lib/weapons/weapons';

export type ArmsManufacturer = {
  name: string;
  description: string;
  models: Weapon[];
};
