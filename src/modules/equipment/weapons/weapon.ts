'use strict';

import type Item from '../item';

export default interface Weapon extends Item {
  damage: string;
  hands: number;
}
