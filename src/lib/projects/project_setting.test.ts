import { describe, expect, it } from 'vitest';

import { deriveSettingTags } from './project_setting';

describe('deriveSettingTags', () => {
  it('appends a tag for each field that is set', () => {
    expect(deriveSettingTags(['homebrew'], { genre: 'fantasy', system: 'adnd-2e' })).toEqual([
      'homebrew',
      'genre:fantasy',
      'system:adnd-2e',
    ]);
  });

  it('appends nothing for a project that is set in nothing', () => {
    expect(deriveSettingTags(['homebrew'], {})).toEqual(['homebrew']);
  });

  it('strips a tag that contradicts the field, because the field is the answer', () => {
    expect(deriveSettingTags(['genre:horror', 'homebrew'], { genre: 'fantasy' })).toEqual([
      'homebrew',
      'genre:fantasy',
    ]);
  });

  it('strips a stale tag when the field it came from has been cleared', () => {
    expect(deriveSettingTags(['genre:horror', 'system:dcc'], {})).toEqual([]);
  });

  it('leaves every other tag alone, in the order it was given', () => {
    expect(deriveSettingTags(['b', 'a', 'maturity:beta'], { system: 'swn' })).toEqual([
      'b',
      'a',
      'maturity:beta',
      'system:swn',
    ]);
  });
});
