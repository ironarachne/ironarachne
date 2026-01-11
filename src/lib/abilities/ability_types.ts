import type { TaggedItem } from "$lib/tags/tag_types";

export type Ability = TaggedItem & {
  name: string;
  description: string;
  category: string;
}
