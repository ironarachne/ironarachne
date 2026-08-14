import type { TaggedItem } from '$lib/tags';

export type Ability = TaggedItem & {
  name: string;
  description: string;
  category: string;
  /** Rough power tier used by species stat blocks and similar content. */
  threatLevel?: number;
};
