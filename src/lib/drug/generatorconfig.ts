import DrugType from "./drugtype.js";
import * as DrugTypes from "./drugtypes.js";
import EffectType from "./effecttype.js";
import * as EffectTypes from "./effecttypes.js";

export default class DrugGeneratorConfig {
  drugTypes: DrugType[];
  effectTypes: EffectType[];

  constructor() {
    let drugTypes = DrugTypes.all();
    let effectTypes = EffectTypes.all();

    this.drugTypes = drugTypes;
    this.effectTypes = effectTypes;
  }
}
