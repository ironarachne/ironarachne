"use strict";

import * as RND from "../random";

const random = require("random");

export function generate() {
  let nameType = RND.item([
    {
      generate: function () {
        let modelNumberPrefix = RND.item([
          "Y", "M", "R", "X", "T", "S", "J", "G", "H",
        ]);

        let modelNumberSuffix = random.int(1, 9) * 10;

        return `${modelNumberPrefix}-${modelNumberSuffix}`;
      },
    },
    {
      generate: function () {
        let modelNumberPrefix1 = RND.item([
          "A", "E", "I", "O", "U"
        ]);
        let modelNumberPrefix2 = RND.item([
          "Y", "M", "R", "X", "T", "S", "J", "G", "H",
        ]);

        let modelNumberSuffix = random.int(1, 9) * 10;

        return `${modelNumberPrefix1}${modelNumberPrefix2}-${modelNumberSuffix}`;
      }
    },
    {
      generate: function () {
        let modelNumberPrefix1 = RND.item([
          "B", "R", "X", "S", "N"
        ]);
        let modelNumberPrefix2 = RND.item([
          "Y", "M", "I", "K", "T", "Q", "J", "G", "H",
        ]);

        let modelNumberSuffix = random.int(1, 99) * 100;

        return `${modelNumberPrefix1}${modelNumberPrefix2}-${modelNumberSuffix}`;
      }
    },
  ]);

  return nameType.generate();
}
