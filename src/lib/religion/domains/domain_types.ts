import type { Mutator } from '$lib/mutator';
import type { TaggedItem } from '$lib/tags/tag_types';
import type { Deity } from '../deities';

export type Domain = TaggedItem & {
  name: string;
  holyItems: string[]; // names of items associated with this domain that could be used as holy items
  holySymbols: string[]; // descriptions of possible holy symbols associated with this domain
  enchantmentNames: string[]; // names of possible item enchantments from enchantments list in equipment library
  mutators: Mutator<Deity>[]; // list of character mutators to apply to characters with this domain
};

export type DomainFilter = {
  name: string | null;
  hasHolyItems: boolean | null;
  hasHolySymbols: boolean | null;
  hasEnchantments: boolean | null;
  requiredTags: string[];
  excludedTags: string[];
};

export type DomainSet = {
  primary: Domain | null;
  secondary: Domain | null;
  tertiary: Domain | null;
};
