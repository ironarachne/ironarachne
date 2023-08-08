"use strict";

import type ReligionCategory from "./category.js";
import Monotheism from "./monotheism.js";
import Polytheism from "./polytheism.js";
import Shamanism from "./shamanism.js";

export function all(): ReligionCategory[] {
  return [new Monotheism(), new Polytheism(), new Shamanism()];
}

export function byName(name: string, categories: ReligionCategory[]): ReligionCategory {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].name === name) {
      return categories[i];
    }
  }

  throw new Error(`No religion category found with name ${name}.`);
}
