import type Ability from "./ability";

export function getAbilityByName(name: string, abilities: Ability[]): Ability {
  let result = abilities.find((ability) => ability.name === name);

  if (result === undefined) {
    throw new Error(`Ability not found: ${name}`);
  }

  return result;
}
