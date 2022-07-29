'use strict';

import DrugType from './drugtype';
import EffectType from './effecttype';
import * as DrugTypes from './drugtypes';
import * as EffectTypes from './effecttypes';

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
