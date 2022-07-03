'use strict';

import type Item from '../item';

export default interface ItemMutator {
  name: string;
  mutate: (item: Item) => Item;
  requiredTag: string;
  tags: string[];
}
