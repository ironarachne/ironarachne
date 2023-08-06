"use strict";

import type Item from "./item.js";

export default interface WornItem extends Item {
  areaOfBody: string;
}
