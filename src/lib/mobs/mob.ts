import type Ability from "$lib/abilities/ability.js";
import type Species from "$lib/species/species.js";
import type Item from "../equipment/item.js";
import type StatBlock from "../statblock.js";

export default interface Mob {
  name: string;
  species: Species;
  description: string;
  summary: string;
  statBlock: StatBlock | null;
  abilities: Ability[];
  carried: Item[];
  threatLevel: number;
  tags: string[];
}
