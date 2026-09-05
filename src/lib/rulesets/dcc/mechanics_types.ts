/**
 * Candidate DCC payload shapes for the first ruleset consumers.
 *
 * These are schemas only. They contain no core tables or rulebook prose, and the disabled legacy
 * descriptor advertises none of them as a supported production capability.
 */
export type DccSavingThrows = {
  fortitude: number;
  reflex: number;
  willpower: number;
};

export type DccActorMechanics = {
  armorClass: number;
  hitPoints: number;
  attackModifier: number;
  saves: DccSavingThrows;
};

export type DccCurrencyId = 'cp' | 'sp' | 'gp';

export type DccCurrencyAmounts = Record<DccCurrencyId, number>;

export type DccWeaponMechanics = {
  kind: 'weapon';
  value: number;
  denomination: DccCurrencyId;
  damage: string;
  range: string;
};

export type DccArmorMechanics = {
  kind: 'armor';
  value: number;
  denomination: DccCurrencyId;
  armorClass: number;
};

export type DccValuableMechanics = {
  kind: 'valuable';
  value: number;
  denomination: DccCurrencyId;
  magical: boolean;
};

export type DccItemMechanics = DccWeaponMechanics | DccArmorMechanics | DccValuableMechanics;

export type DccTreasureItemContext = {
  kind: DccItemMechanics['kind'];
  minimumValue: number;
  maximumValue: number;
  denomination: DccCurrencyId;
};
