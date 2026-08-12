import type { RNG } from '@ironarachne/rng';
import type { WeaponType } from './weapons';

export type WeaponGeneratorConfig = {
  weaponTypes: WeaponType[];
  rng: RNG;
};

export function getDefaultConfig(rng: RNG): WeaponGeneratorConfig {
  return {
    weaponTypes: [],
    rng,
  };
}
