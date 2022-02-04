'use strict';

import ReligionCategory from './category';
import * as RND from '../../random';

export default class Polytheism extends ReligionCategory {
  constructor() {
    super();
    this.name = 'polytheism';
    this.description = 'This religion ' + RND.item(['has several gods', 'is polytheistic']) + '.';
    this.hasDeities = true;
    this.hasLeader = true;
    this.minDeities = 2;
    this.maxDeities = 16;
  }
}
