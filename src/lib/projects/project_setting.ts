import {
  GENRE_TAG_PREFIX,
  SYSTEM_TAG_PREFIX,
  genreTag,
  systemTag,
  type GameSystem,
  type Genre,
} from '$lib/tools';

/** What a project is set in, as the two fields that decide its derived tags. */
export type ProjectSetting = {
  genre?: Genre;
  system?: GameSystem;
};

/**
 * Tags with the `genre:` and `system:` entries rebuilt from the fields that own them.
 *
 * The fields are the answer and the tags are derived — the both-shapes pattern `defineTool` uses
 * for a tool's maturity, and for the same reason: every reader wants exactly one answer to "what is
 * this project set in", which only a field guarantees, while the tag keeps the fact composing with
 * the filtering in `$lib/tags`.
 *
 * A project's tags differ from a catalog entry's in the way that makes this function necessary,
 * though. `ProjectChanges.tags` is a wholesale rewrite and an import carries whatever the file
 * said, so anything already prefixed is stripped before the derived tags are appended. Run on every
 * read and every write, that leaves no path by which a stored tag can contradict the field beside
 * it — which means nothing downstream has to decide which of the two to believe.
 */
export function deriveSettingTags(tags: string[], setting: ProjectSetting): string[] {
  const authored = tags.filter(
    (tag) => !tag.startsWith(GENRE_TAG_PREFIX) && !tag.startsWith(SYSTEM_TAG_PREFIX),
  );

  return [
    ...authored,
    ...(setting.genre === undefined ? [] : [genreTag(setting.genre)]),
    ...(setting.system === undefined ? [] : [systemTag(setting.system)]),
  ];
}
