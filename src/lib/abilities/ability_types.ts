import type { TaggedItem } from '$lib/tags/tag_types';

export type Ability = TaggedItem & {
  name: string;
  description: string;
  category: string;
  /** Rough power tier used by species stat blocks and similar content. */
  threatLevel?: number;
};
