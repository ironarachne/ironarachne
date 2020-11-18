import * as iarnd from "../random.js";
import * as Variation from "./variations.js";

export function all() {
  return [
    {
      name: "plain",
      blazon: "variation1",
      variationCount: 1,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/></pattern>',
    },
    {
      name: "fess",
      blazon: "per fess variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="330" fill="url(#variation1)"/><rect x="0" y="330" width="600" height="330" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "pale",
      blazon: "per pale variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="660" fill="url(#variation1)"/><rect x="300" y="0" width="300" height="660" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "bend",
      blazon: "per bend variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,660 0,660" fill="url(#variation1)"/><polygon points="0,0 600,660 600,0" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "bend sinister",
      blazon: "per bend sinister variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 0,660" fill="url(#variation1)"/><polygon points="600,0 600,660 0,660" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "quarterly",
      blazon: "quarterly variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="330" fill="url(#variation1)"/><rect x="300" y="0" width="300" height="330" fill="url(#variation2)"/><rect x="300" y="330" width="300" height="330" fill="url(#variation1)"/><rect x="0" y="330" width="300" height="330" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "saltire",
      blazon: "per saltire variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 300,330" fill="url(#variation1)"/><polygon points="600,0 600,660 300,330" fill="url(#variation2)"/><polygon points="300,330 600,660 0,660" fill="url(#variation1)"/><polygon points="0,0 300,330 0,660" fill="url(#variation2)"/></pattern>',
    },
    {
      name: "chevron",
      blazon: "per chevron variation1 and variation2",
      variationCount: 2,
      pattern:
        '<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/><polygon points="0,660 300,330 600,660" fill="url(#variation2)"/></pattern>',
    },
  ];
}

export function random() {
  let options = all();
  let result = iarnd.item(options);
  return result;
}

export function renderBlazon(field) {
  let blazon = field.blazon;

  blazon = blazon.replace(
    "variation1",
    Variation.renderBlazon(field.variations[0])
  );

  if (field.variations.length > 1) {
    blazon = blazon.replace(
      "variation2",
      Variation.renderBlazon(field.variations[1])
    );
  }

  return blazon;
}
