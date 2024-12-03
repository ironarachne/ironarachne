import type DrugType from "./drug_type";
import type EffectType from "./effect_type";

export default interface DrugGeneratorConfig {
    drugTypes: DrugType[];
    effectTypes: EffectType[];
}