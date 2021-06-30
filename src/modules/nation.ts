"use strict";

import * as RND from "./random";
import * as CommonNames from "./names/common";

export function generate() {
  const nation = {
    name: "",
    description: "",
  };

  const nationType = randomType();

  const name = RND.item(CommonNames.nations());

  nation.name = nationType.nameTemplate.replace("{name}", name);

  return nation;
}

function randomType() {
  return RND.item([
    {
      name: "monarchy",
      nameTemplate: "the Kingdom of {name}",
    },
    {
      name: "republic",
      nameTemplate: "the Republic of {name}",
    },
    {
      name: "empire",
      nameTemplate: "the {name} Empire",
    },
  ]);
}
