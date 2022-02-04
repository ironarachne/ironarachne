'use strict';

import SettlementCategory from './category';

export default class Borough extends SettlementCategory {
  constructor() {
    super();
    this.name = 'borough';
    this.minSize = 10000;
    this.maxSize = 19999;
    this.sizeClass = 'medium';
    this.possibleDescriptions = [
      'Multiple industries make their home here, roughly organized in specialized districts.',
      'Though home to many different trades and people, there seems to be no real organization to this borough.',
      'This borough is more sprawling than dense, with many single-story buildings spread far apart.',
    ];
  }
}
