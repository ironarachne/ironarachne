export default interface ReleaseNote {
  date: string;
  /**
   * The released version this note describes, where one exists.
   *
   * Optional because the site predates versioning by five years: only the releases cut since
   * `docs/versioning.md` was written have a number, and inventing one for the other seventy-odd
   * entries would be fabricating a history that never happened.
   */
  version?: string;
  summary: string;
  features?: string[];
  improvements?: string[];
  fixes?: string[];
  housekeeping?: string[];
}
