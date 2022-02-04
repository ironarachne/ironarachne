'use strict';

import SettlementCategory from './category';

export default class Hamlet extends SettlementCategory {
  constructor() {
    super();
    this.name = 'hamlet';
    this.minSize = 10;
    this.maxSize = 49;
    this.sizeClass = 'small';
    this.possibleDescriptions = [
      'Buildings here are scattered and small.',
      'The farms here are clustered together.',
      'There are only a handful of farms scattered around a single community building here.',
    ];
  }
}
