import type Species from "../species.js";

export function modify(species: Species): Species {
  let result: Species = JSON.parse(JSON.stringify(species));

  let modifierName = "zombie";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push(
    {
      name: "self-resurrection",
      description: "can resurrect itself unless the head is destroyed or removed",
      category: "self-resurrection",
      threatLevel: 3,
    },
  );

  let newTags = [];

  for (let i = 0; i < result.tags.length; i++) {
    if (result.tags[i] != "sentient") {
      newTags.push(result.tags[i]);
    }
  }

  result.tags = newTags;

  result.abilities.push(
    {
      name: "zombification bite",
      description: "can bite others to transform them into zombies",
      category: "attack",
      threatLevel: 2,
    },
  );
  result.tags.push("zombie");
  result.tags.push("undead");

  return result;
}
