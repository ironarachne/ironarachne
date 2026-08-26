import type { RouteId } from '$app/types';

/**
 * One generation run, as the log remembers it.
 *
 * It carries no label, no payload, and no project: the tool catalog owns the first — a stored copy
 * would be a second name for a tool that can disagree with the first — there is no second, and a
 * run is not a thing a project holds until somebody saves it.
 */
export type SessionLogEntry = {
  /** Stable identity for the life of the session. Never reused. */
  id: string;
  /** A tool catalog path, the one edge from the log to the tool registry. */
  toolPath: RouteId;
  /** A one-line name for what came out. Absent for a tool with no name to give. */
  summary?: string;
  /** The seed the run rolled from. */
  seed: string;
  /**
   * The settings the run rolled *with*, as the tool understood them — not the settings in its
   * controls now. The log does not interpret it; it is a courier.
   *
   * Stored as a canonical deep copy, so a tool that mutates its own config object in place cannot
   * rewrite history, and a `$state` proxy cannot leak into the log.
   */
  config: Record<string, unknown>;
  /** Epoch milliseconds, per decision 2 of the workshop model. */
  at: number;
};

/**
 * What a tool hands over at the end of its `generate()`.
 *
 * `config` is optional because a generator with no settings has none to report; it becomes `{}` on
 * the entry rather than being absent, so every entry answers the same question the same way.
 */
export type GenerationReport = {
  toolPath: RouteId;
  summary?: string;
  seed: string;
  config?: Record<string, unknown>;
};

/**
 * Identity and time, supplied rather than generated — the same bargain `ArtifactMutationOptions`
 * makes, and for the same reason: a test that has to race the clock is a test that fails on CI.
 */
export type SessionLogRecordOptions = {
  id?: string;
  now?: number;
};

/**
 * Told that the log changed, and nothing about how.
 *
 * There is one list in one place and reading it is cheap, so an event carrying a delta would be a
 * second, staler copy of something the listener is about to read anyway.
 */
export type SessionLogListener = () => void;
