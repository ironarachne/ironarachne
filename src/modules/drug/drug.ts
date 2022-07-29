'use strict';

import DrugType from './drugtype';
import EffectType from './effecttype';
import * as Words from '../words';

export default class Drug {
  name: string;
  drugType: DrugType;
  method: string;
  effectType: EffectType;
  effectDescription: string;
  strength: string;
  color: string;
  duration: string;
  sideEffect: string;
  commonality: string;

  constructor(drugType: DrugType, effectType: EffectType) {
    this.drugType = drugType;
    this.name = '';
    this.method = '';
    this.effectType = effectType;
    this.effectDescription = '';
    this.strength = '';
    this.color = '';
    this.duration = '';
    this.sideEffect = '';
    this.commonality = '';
  }

  describe() {
    let description = this.name + ' is a ' + this.strength + ' ' + this.effectType.name + '. ';
    description +=
      "It's " +
      Words.article(this.color) +
      ' ' +
      this.color +
      ' ' +
      this.drugType.name +
      ' that is ' +
      this.method +
      '. ';
    description += this.effectDescription;
    description += ' ' + this.duration;
    description += ' Side effects can include ' + this.sideEffect + '. ';
    description += this.commonality;

    return description;
  }
}
