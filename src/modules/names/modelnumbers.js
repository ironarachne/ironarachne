import * as iarnd from "../random.js";

const random = require("random");

export function generate() {
  let nameType = iarnd.item([
    {
      generate: function() {
        let modelNumberPrefix = iarnd.item([
          'Y', 'M', 'R', 'X', 'T', 'S', 'J', 'G', 'H',
        ]);

        let modelNumberSuffix = random.int(1, 9) * 10;

        return `${modelNumberPrefix}-${modelNumberSuffix}`;
      },
    },
    {
      generate: function() {
        let modelNumberPrefix1 = iarnd.item([
          'A', 'E', 'I', 'O', 'U'
        ]);
        let modelNumberPrefix2 = iarnd.item([
          'Y', 'M', 'R', 'X', 'T', 'S', 'J', 'G', 'H',
        ]);

        let modelNumberSuffix = random.int(1, 9) * 10;

        return `${modelNumberPrefix1}${modelNumberPrefix2}-${modelNumberSuffix}`;
      }
    },
    {
      generate: function() {
        let modelNumberPrefix1 = iarnd.item([
          'B', 'R', 'X', 'S', 'N'
        ]);
        let modelNumberPrefix2 = iarnd.item([
          'Y', 'M', 'I', 'K', 'T', 'Q', 'J', 'G', 'H',
        ]);

        let modelNumberSuffix = random.int(1, 99) * 100;

        return `${modelNumberPrefix1}${modelNumberPrefix2}-${modelNumberSuffix}`;
      }
    },
  ]);

  return nameType.generate();
}
