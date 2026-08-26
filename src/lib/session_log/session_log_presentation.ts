import type { SessionLogEntry } from './session_log_types';

/**
 * Turning an entry into what a reader is told.
 *
 * Presentation, and in the library rather than in the `.svelte` file for the same reason
 * `storage_presentation.ts` is: components here have no unit tests, and a rule nobody tests is a
 * rule that quietly stops holding. Nothing in this file draws; it returns strings.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long ago a run happened, in a column two words wide: `just now`, `4 min ago`, `2 hr ago`.
 *
 * A log is by definition minutes old, so the bands stop being useful quickly — but a session left
 * open overnight is an ordinary thing to do, so days are there rather than reading `27 hr ago`.
 * A time in the future reads as `just now`: a clock that went backwards is not something to
 * explain to the user in fourteen rem.
 */
export function runAge(at: number, now: number): string {
  const elapsed = now - at;
  if (elapsed < MINUTE) {
    return 'just now';
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)} hr ago`;
  }
  const days = Math.floor(elapsed / DAY);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

function describeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'none';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value) ?? 'none';
    } catch {
      return 'none';
    }
  }
  return String(value);
}

/** One setting as `key: value`. An empty list reads as `none` rather than as nothing at all. */
function describeSetting(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.map((item) => describeValue(item)).join(', ');
    return `${key}: ${value.length === 0 ? 'none' : items}`;
  }
  return `${key}: ${describeValue(value)}`;
}

/**
 * The settings a run used, as one line: `size: small · nameGeneratorSet: human`.
 *
 * It goes in the entry's accessible name and its `title`, where it costs no width — which is the
 * whole reason it may be this long and this literal. Keys are the tool's own, unprettified: the
 * log is a courier for a config it does not interpret, and inventing display names for settings it
 * has never seen is how a label ends up describing the wrong thing.
 *
 * A tool with no settings gets an empty string rather than `no settings`, so the caller composing
 * a sentence decides what silence looks like.
 */
export function describeRunSettings(config: Record<string, unknown>): string {
  return Object.entries(config)
    .map(([key, value]) => describeSetting(key, value))
    .join(' · ');
}

/** The first line of an entry: what came out, or the seed when the tool had no name to give. */
export function runHeadline(entry: SessionLogEntry): string {
  return entry.summary === undefined || entry.summary.trim() === '' ? entry.seed : entry.summary;
}

/**
 * What the entry's button says out loud: what it was, what made it, and what pressing it will do.
 *
 * The tool's label is passed in rather than looked up, because the catalog owns it and this
 * library has no business importing the tool registry to render a row.
 */
export function runAccessibleName(entry: SessionLogEntry, toolLabel: string, now: number): string {
  const settings = describeRunSettings(entry.config);
  return [
    `Roll ${runHeadline(entry)} again`,
    `${toolLabel}, ${runAge(entry.at, now)}`,
    `seed ${entry.seed}`,
    ...(settings === '' ? [] : [settings]),
  ].join(' — ');
}
