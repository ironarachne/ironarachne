export type Weapon = {
  name: string;
  maker: string;
  damage: string;
  cosmetics: string[];
  effects: string[];
  description: string;
};

export type WeaponEffect = {
  name: string;
  options: string[];
};

export type WeaponComponent = {
  name: string;
  options: string[];
};

export type WeaponType = {
  name: string;
  bases: string[];
  cosmetics: WeaponComponent[];
  effects: WeaponEffect[];
  range: string;
  hands: number;
  damageType: string;
};
