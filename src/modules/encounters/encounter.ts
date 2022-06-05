'use strict';

import MobGroup from './mobgroup';

export default class Encounter {
  groups: MobGroup[];

  constructor(groups: MobGroup[]) {
    this.groups = groups;
  }
}
