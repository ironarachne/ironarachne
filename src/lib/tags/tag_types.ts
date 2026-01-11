export interface TagFilter {
  includeTags?: string[];
  excludeTags?: string[];
  includeAllTags?: string[];
}

export interface TaggedItem {
  tags: string[];
}
