import type * as TagTypes from './tag_types';

export function applyTagFilter<T extends TagTypes.TaggedItem>(
  items: T[],
  filter: TagTypes.TagFilter,
): T[] {
  return items.filter((item) => {
    if (filter.includeTags) {
      for (let tag of filter.includeTags) {
        if (!item.tags.includes(tag)) {
          return false;
        }
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
