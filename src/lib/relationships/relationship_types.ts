import type { TaggedItem } from "$lib/tags/tag_types";

export type Relationship = {
    id: string;
    originatorId: string;
    recipientId: string;
    type: RelationshipType;
    description: string;
}

export type RelationshipType = TaggedItem &{
    name: string;
    reciprocalName: string;
    descriptionPhraseTemplates: string[];
    incompatibleWithTypes: string[]; // array of RelationshipType names
    isOneSided: boolean;
}
