'use strict';

import type { Item } from '../../equipment/item';

export default class Key implements Item {
  name: string;
  description: string;
  value: number;
  lockId: string;
}
