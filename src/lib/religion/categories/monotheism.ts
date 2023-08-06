"use strict";

import * as RND from "@ironarachne/rng";
import ReligionCategory from "./category.js";

export default class Monotheism extends ReligionCategory {
  constructor() {
    super();
    this.name = "monotheism";
    this.description = "This religion " + RND.item(["has a single all-powerful god", "is monotheistic"]) + ".";
    this.hasDeities = true;
    this.minDeities = 1;
    this.maxDeities = 1;
  }
}
