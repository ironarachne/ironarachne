'use strict';

import ReligionCategory from './category';
import * as RND from '../../random';

export default class Monotheism extends ReligionCategory {
  constructor() {
    super();
    this.name = 'monotheism';
    this.description =
      'This religion ' + RND.item(['has a single all-powerful god', 'is monotheistic']) + '.';
    this.hasDeities = true;
    this.minDeities = 1;
    this.maxDeities = 1;
  }
}
