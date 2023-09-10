import type Species from "../species.js";

export function modify(species: Species): Species {
  let result: Species = JSON.parse(JSON.stringify(species));

  let modifierName = "skeletal";

  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push(
    {
      name: "immunity: piercing",
      description: "immune to piercing damage",
      category: "immunity",
      threatLevel: 1,
    },
  );
  result.tags.push("skeleton");
  result.tags.push("undead");

  return result;
}
