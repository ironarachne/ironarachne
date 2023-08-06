"use strict";

import * as RND from "@ironarachne/rng";
import Field from "./field.js";

export function all() {
  return [
    new Field(
      "plain",
      "variation1",
      1,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/></pattern>`,
      10,
    ),
    new Field(
      "fess",
      "per fess variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="330" fill="url(#variation1)"/><rect x="0" y="330" width="600" height="330" fill="url(#variation2)"/></pattern>`,
      5,
    ),
    new Field(
      "pale",
      "per pale variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="660" fill="url(#variation1)"/><rect x="300" y="0" width="300" height="660" fill="url(#variation2)"/></pattern>`,
      5,
    ),
    new Field(
      "bend",
      "per bend variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,660 0,660" fill="url(#variation1)"/><polygon points="0,0 600,660 600,0" fill="url(#variation2)"/></pattern>`,
      5,
    ),
    new Field(
      "bend sinister",
      "per bend sinister variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 0,660" fill="url(#variation1)"/><polygon points="600,0 600,660 0,660" fill="url(#variation2)"/></pattern>`,
      5,
    ),
    new Field(
      "quarterly",
      "quarterly variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="300" height="330" fill="url(#variation1)"/><rect x="300" y="0" width="300" height="330" fill="url(#variation2)"/><rect x="300" y="330" width="300" height="330" fill="url(#variation1)"/><rect x="0" y="330" width="300" height="330" fill="url(#variation2)"/></pattern>`,
      5,
    ),
    new Field(
      "saltire",
      "per saltire variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><polygon points="0,0 600,0 300,330" fill="url(#variation1)"/><polygon points="600,0 600,660 300,330" fill="url(#variation2)"/><polygon points="300,330 600,660 0,660" fill="url(#variation1)"/><polygon points="0,0 300,330 0,660" fill="url(#variation2)"/></pattern>`,
      2,
    ),
    new Field(
      "chevron",
      "per chevron variation1 and variation2",
      2,
      `<pattern id="Division" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/><polygon points="0,660 300,330 600,660" fill="url(#variation2)"/></pattern>`,
      2,
    ),
  ];
}

export function random(): Field {
  const options = all();
  return RND.item(options);
}

export function randomFrom(fields: Field[]): Field {
  return RND.item(fields);
}
