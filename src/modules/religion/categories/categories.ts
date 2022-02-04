"use strict";

import ReligionCategory from "./category";
import Monotheism from "./monotheism";
import Polytheism from "./polytheism";
import Shamanism from "./shamanism";

export function all(): ReligionCategory[] {
  return [
    new Monotheism(),
    new Polytheism(),
    new Shamanism(),
  ];
}
