import type { TagFilter, TaggedItem } from '$lib/tags';

export type Relationship = {
  id: string;
  originatorId: string;
  recipientId: string;
  type: RelationshipType;
  description: string;
};

export type RelationshipGenerationConfig = {
  tagFilter?: TagFilter;
};

export type RelationshipType = TaggedItem & {
  name: string;
  reciprocalName: string;
  descriptionPhraseTemplates: string[];
  incompatibleWithTypes: string[]; // array of RelationshipType names
  isOneSided: boolean;
};
