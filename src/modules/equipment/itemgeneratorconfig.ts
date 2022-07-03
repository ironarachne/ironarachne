'use strict';

import Component from './components/component';
import type Pattern from './patterns/pattern';
import * as Components from './components/components';
import type ItemMutator from './mutators/itemmutator';
import * as Mutators from './mutators/mutators';

export default class ItemGeneratorConfig {
  pattern: Pattern;
  components: Component[];
  minValue: number;
  maxValue: number;
  minQuality: number;
  maxQuality: number;
  mutators: ItemMutator[];
  useMutator: boolean;

  constructor() {
    this.components = Components.all();
    this.minValue = 0;
    this.maxValue = 0;
    this.minQuality = 0;
    this.maxQuality = 1;
    this.mutators = Mutators.all();
    this.useMutator = false;
  }
}
