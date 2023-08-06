"use strict";

import ReligionCategory from "./category.js";
import Monotheism from "./monotheism.js";
import Polytheism from "./polytheism.js";
import Shamanism from "./shamanism.js";

export function all(): ReligionCategory[] {
  return [new Monotheism(), new Polytheism(), new Shamanism()];
}
