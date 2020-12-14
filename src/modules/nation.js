import * as iarnd from "./random.js";
import * as CommonNames from "./names/common.js";

export function generate() {
  let nation = {
    name: "",
    description: "",
  };

  let nationType = randomType();

  let name = iarnd.item(CommonNames.nations());

  nation.name = nationType.nameTemplate.replace("{name}", name);

  return nation;
}

function randomType() {
  return iarnd.item([
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
