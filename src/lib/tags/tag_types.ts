export interface TagFilter {
  includeSomeTags?: string[];
  excludeTags?: string[];
  includeAllTags?: string[];
}

export interface TaggedItem {
  tags: string[];
}
