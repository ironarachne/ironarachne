import type Ability from "$lib/abilities/ability";
import type ItemGenerator from "$lib/equipment/itemgenerator";

export default interface Archetype {
  name: string;
  abilities: Ability[];
  tags: string[];
  threatLevel: number;
  itemGenerators: ItemGenerator[];
}
