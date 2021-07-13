"use strict";

import * as RND from "../random";
import * as InventedNames from "../names/invented";
import Nation from "./nation";
import GovernmentType from "./governmenttype";

export function generate(): Nation {
  const governmentType = RND.item(allTypes());

  let name = randomName(governmentType);

  return new Nation(name, "", governmentType);
}

function allTypes(): GovernmentType[] {
  return [
    new GovernmentType(
      "monarchy",
      [
        "the Kingdom of {name}",
        "the Grand Kingdom of {name}",
        "the Principality of {name}",
      ],
      "a country ruled by a single hereditary monarch"
    ),
    new GovernmentType(
      "republic",
      [
        "the Republic of {name}",
        "the Grand Republic of {name}",
        "the Holy Republic of {name}",
      ],
      "a country governed by a ruling council"
    ),
    new GovernmentType(
      "empire",
      [
        "the {name} Empire",
        "the Holy {name} Empire",
        "the Empire of {name}",
      ],
      "a country ruled by an emperor"
    ),
  ];
}

export function randomName(governmentType: GovernmentType): string {
  const patterns = [
    "pvlvlIA",
    "lvpvpIA",
    "vnvlvpA",
    "vpvlY",
    "flvnv",
    "vfpvlION",
  ];

  const nameFragment = InventedNames.generate(patterns);
  const nameTemplate = RND.item(governmentType.nameTemplates);

  return nameTemplate.replaceAll('{name}', nameFragment);
}
