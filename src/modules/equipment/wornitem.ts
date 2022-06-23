'use strict';

import type Item from './item';

export default interface WornItem extends Item {
  areaOfBody: string;
}
