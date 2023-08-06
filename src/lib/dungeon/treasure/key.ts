"use strict";

import type Item from "../../equipment/item.js";

export default class Key implements Item {
  name: string;
  description: string;
  value: number;
  lockId: string;
  quality: number;
  tags: string[];
}
