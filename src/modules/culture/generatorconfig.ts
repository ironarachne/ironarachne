'use strict';

import * as CultureNames from '../names/cultures';
import GeneratorSet from '../names/generatorset';

export default class CultureGeneratorConfig {
  generatorSet: GeneratorSet;

  constructor() {
    this.generatorSet = CultureNames.randomGenSet();
  }
}
