import type DrugType from "./drug_type";
import type EffectType from "./effect_type";

export default interface Drug {
  name: string;
  description: string;
  drugType: DrugType;
  method: string;
  effectType: EffectType;
  effectDescription: string;
  strength: string;
  color: string;
  duration: string;
  sideEffect: string;
  commonality: string;
}
