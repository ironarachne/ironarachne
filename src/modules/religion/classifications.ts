"use strict";

import PantheonClassification from "./pantheonclassification";
import * as RND from "../random";

export function all(): PantheonClassification[] {
  return [
    new PantheonClassification(
      "patriarchal autocracy",
      true,
      "male",
      5,
      12,
    ),
    new PantheonClassification(
      "matriarchal autocracy",
      true,
      "female",
      5,
      12,
    ),
    new PantheonClassification(
      "egalitarian society",
      false,
      "",
      5,
      12,
    ),
    new PantheonClassification(
      "monotheistic domain",
      false,
      "",
      1,
      1,
    ),
  ];
}

export function random(): PantheonClassification {
  const classifications = all();
  return RND.item(classifications);
}
