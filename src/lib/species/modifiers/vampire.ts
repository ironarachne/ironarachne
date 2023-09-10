import type Species from "../species.js";

export function modify(species: Species): Species {
  let result: Species = JSON.parse(JSON.stringify(species));

  let modifierName = "vampire";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;

  let vampiricAbilities = [
    {
      name: "vampiric bite",
      description: "can bite others to drain their life force and heal itself",
      category: "attack",
      threatLevel: 2,
    },
    {
      name: "vampiric charm",
      description: "can charm others to do its bidding",
      category: "attack",
      threatLevel: 3,
    },
    {
      name: "shapeshift into animal",
      description: "can shapeshift into an animal",
      category: "shapeshift",
      threatLevel: 2,
    },
    {
      name: "darkvision",
      description: "can see in darkness",
      category: "senses",
      threatLevel: 1,
    },
    {
      name: "resistance: magic",
      description: "is resistant to magic",
      category: "resistance",
      threatLevel: 2,
    },
    {
      name: "shapeshift into mist",
      description: "can shapeshift into mist",
      category: "shapeshift",
      threatLevel: 2,
    },
  ];
  result.abilities = result.abilities.concat(vampiricAbilities);
  result.tags.push("vampire");
  result.tags.push("undead");

  return result;
}
