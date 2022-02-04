'use strict';

import ReligionCategory from './category';

export default class Shamanism extends ReligionCategory {
  constructor() {
    super();
    this.name = 'shamanism';
    this.description = 'This religion is shamanistic.';
  }
}
