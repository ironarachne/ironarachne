import type Item from "../item.js";
import type ItemMutator from "./itemmutator.js";

export default class MeleeWeaponMutator implements ItemMutator {
  name: string;
  mutate: (item: Item) => Item;
  requiredTag: string;
  tags: string[];

  constructor(
    name: string,
    mutate: (item: Item) => Item,
    requiredTag: string,
    tags: string[],
  ) {
    this.name = name;
    this.mutate = mutate;
    this.requiredTag = requiredTag;
    this.tags = tags;
  }
}
