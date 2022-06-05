'use strict';

import type Mob from './mob';

export default class MobGroup {
  name: string;
  mobs: Mob[];

  constructor(name: string, mobs: Mob[]) {
    this.name = name;
    this.mobs = mobs;
  }
}
