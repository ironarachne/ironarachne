import { applyTagFilter } from './tags';
import type { TagFilter, TaggedItem } from './tag_types';

describe('applyTagFilter', () => {
  const items: TaggedItem[] = [
    { tags: ['a', 'b', 'c'] },
    { tags: ['b', 'c'] },
    { tags: ['c'] },
    { tags: ['a'] },
    { tags: [] },
  ];

  it('filters by includeSomeTags', () => {
    const filter: TagFilter = { includeSomeTags: ['a'] };
    const result = applyTagFilter(items, filter);
    expect(result).toEqual([
      { tags: ['a', 'b', 'c'] },
      { tags: ['a'] },
    ]);
  });

  it('filters by includeAllTags', () => {
    const filter: TagFilter = { includeAllTags: ['b', 'c'] };
    const result = applyTagFilter(items, filter);
    expect(result).toEqual([
      { tags: ['a', 'b', 'c'] },
      { tags: ['b', 'c'] },
    ]);
  });

  it('filters by excludeTags', () => {
    const filter: TagFilter = { excludeTags: ['a'] };
    const result = applyTagFilter(items, filter);
    expect(result).toEqual([
      { tags: ['b', 'c'] },
      { tags: ['c'] },
      { tags: [] },
    ]);
  });

  it('combines includeSomeTags and excludeTags', () => {
    const filter: TagFilter = { includeSomeTags: ['c'], excludeTags: ['a'] };
    const result = applyTagFilter(items, filter);
    expect(result).toEqual([
      { tags: ['b', 'c'] },
      { tags: ['c'] },
    ]);
  });

  it('returns all items if filter is empty', () => {
    const filter: TagFilter = {};
    const result = applyTagFilter(items, filter);
    expect(result).toEqual(items);
  });
});
