'use strict';

import MeleeWeapon from '../weapons/melee';
import type ItemMutator from './itemmutator';

export default class MeleeWeaponMutator implements ItemMutator {
  name: string;
  mutate: (item: MeleeWeapon) => MeleeWeapon;
  requiredTag: string;
  tags: string[];

  constructor(
    name: string,
    mutate: (item: MeleeWeapon) => MeleeWeapon,
    requiredTag: string,
    tags: string[],
  ) {
    this.name = name;
    this.mutate = mutate;
    this.requiredTag = requiredTag;
    this.tags = tags;
  }
}
