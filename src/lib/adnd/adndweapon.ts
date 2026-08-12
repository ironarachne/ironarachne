export default interface ADNDWeapon {
  name: string;
  damageType: string; // bludgeoning, piercing, slashing
  damageSM: string; // dice expression
  damageL: string; // dice expression
  cost: number; // in copper pieces
  weight: number; // in pounds
  size: string; // small, medium, large
  speedFactor: number;
  category: string;
  usesAmmo: boolean;
}
