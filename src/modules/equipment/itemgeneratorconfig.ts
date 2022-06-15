'use strict';

import Component from './components/component';
import type Pattern from './patterns/pattern';
import * as Components from './components/components';

export default class ItemGeneratorConfig {
  pattern: Pattern;
  components: Component[];
  minValue: number;
  maxValue: number;

  constructor() {
    this.components = Components.all();
    this.minValue = 0;
    this.maxValue = 0;
  }
}
