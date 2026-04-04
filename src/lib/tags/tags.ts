import type * as TagTypes from './tag_types';

export function applyTagFilter<T extends TagTypes.TaggedItem>(
  items: T[],
  filter: TagTypes.TagFilter,
): T[] {
  if (!filter || Object.keys(filter).length === 0) {
    return items;
  }

  return items.filter((item) => {
    if (filter.includeSomeTags) {
      let hasAtLeastOneTag = false;
      for (let tag of filter.includeSomeTags) {
        if (item.tags.includes(tag)) {
          hasAtLeastOneTag = true;
          break;
        }
      }
      if (!hasAtLeastOneTag) {
        return false;
      }
    }
    if (filter.includeAllTags) {
      for (let tag of filter.includeAllTags) {
        if (!item.tags.includes(tag)) {
          return false;
        }
      }
    }
    if (filter.excludeTags) {
      for (let tag of filter.excludeTags) {
        if (item.tags.includes(tag)) {
          return false;
        }
      }
    }
    return true;
  });
}
