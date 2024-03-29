import type Item from "../item.js";

export default interface ItemMutator {
  name: string;
  mutate: (item: Item) => Item;
  requiredTag: string;
  tags: string[];
}
