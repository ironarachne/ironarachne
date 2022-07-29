'use strict';

export default class EffectType {
  name: string;
  effects: string[];

  constructor(name: string, effects: string[]) {
    this.name = name;
    this.effects = effects;
  }
}
