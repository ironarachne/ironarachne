import { notifySessionLogChanged } from './session_log_events';
import type {
  GenerationReport,
  SessionLogEntry,
  SessionLogRecordOptions,
} from './session_log_types';

/**
 * How many runs the log keeps, newest first.
 *
 * Not a storage limit — nothing is stored — but a bound on an array that somebody leaning on
 * Generate would otherwise grow without limit. Fifty is comfortably more than "the one three
 * rolls back", which is the whole of what this is for.
 */
export const SESSION_LOG_CAP = 50;

/**
 * The log itself: module state, cleared by a reload.
 *
 * That is the definition of "this session" (decision 2 in docs/session-log.md), and it is what
 * makes replay safe without versioning — a config recorded by this build can only ever be replayed
 * into this build's tool, so a config key that changed shape between releases cannot reach a tool
 * that would misread it. Newest first, so the list is in the order the panel renders it.
 */
let entries: SessionLogEntry[] = [];

/** Counter behind {@link unmatchableKey}. */
let keyFallbacks = 0;

/**
 * A random, never-reused entry id. Mirrors `newArtifactId`, fallback and all: an id with less
 * entropy behind it is a better outcome than a roll that throws on its way out of a generator.
 */
export function newSessionLogEntryId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid !== undefined) {
    return uuid;
  }
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * What a cycle in a config becomes. A config should not have one — this is a tool handing over a
 * live object graph rather than settings — but recursing into it would take the whole page down,
 * and losing a user's roll to a generator's bug is the wrong trade.
 */
export const SESSION_CONFIG_CYCLE = '[cycle]';

/**
 * A value rebuilt as plain data with its object keys in sorted order.
 *
 * Two jobs in one pass. It is what makes {@link sessionRunKey} a canonical key — `{a, b}` and
 * `{b, a}` are the same settings and must produce the same string — and it is what keeps the
 * stored config honest: several generators mutate their config object in place between rolls, and
 * a `$state` value handed over from a component is a deep proxy. Copying here means an entry
 * records what the run actually used and cannot be rewritten afterwards.
 *
 * `ancestors` is the path from the root rather than every object seen, so a value that appears
 * twice in the same config is written out twice — only a genuine cycle is cut.
 */
function canonicalise(value: unknown, ancestors: object[]): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (ancestors.includes(value)) {
    return SESSION_CONFIG_CYCLE;
  }
  const path = [...ancestors, value];
  if (Array.isArray(value)) {
    return value.map((item) => canonicalise(item, path));
  }
  const source = value as Record<string, unknown>;
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    copy[key] = canonicalise(source[key], path);
  }
  return copy;
}

/** A config as the log stores it: plain, deeply copied, keys in a fixed order. */
export function canonicalSessionConfig(
  config: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return canonicalise(config ?? {}, []) as Record<string, unknown>;
}

/**
 * A key that can never equal another, for a config the key cannot be built from.
 *
 * Cycles are already cut by {@link canonicalise}, so what is left is a config holding something
 * `JSON` has no notation for — a `BigInt`, most plausibly — which no generator should be handing
 * over. When it happens the honest answer is "this run matches nothing", which costs a duplicate
 * row; refusing to record the run, or throwing back into the `generate()` that called us, would
 * cost the user their roll.
 */
function unmatchableKey(): string {
  keyFallbacks += 1;
  return `unmatchable:${keyFallbacks}`;
}

/**
 * The identity of a run: its tool, its seed, and its settings.
 *
 * This is what decides whether a report is a new entry or an old one seen again, and it is the
 * single most test-worthy thing in this library. Replaying an entry causes a real generation run,
 * and a tool reports every run it makes, so without a canonical comparison the list would grow a
 * copy every time somebody pressed the same entry twice.
 */
export function sessionRunKey(
  toolPath: string,
  seed: string,
  config: Record<string, unknown> | undefined,
): string {
  try {
    return JSON.stringify([toolPath, seed, canonicalSessionConfig(config)]);
  } catch {
    return unmatchableKey();
  }
}

/** The key of an entry already in the log. */
function keyOf(entry: SessionLogEntry): string {
  return sessionRunKey(entry.toolPath, entry.seed, entry.config);
}

/**
 * Record a run, and hand back the entry that now stands for it.
 *
 * A run whose tool, seed, and config match one already in the log **moves that entry to the top**
 * rather than adding a second: it is the same run, seen again, so it keeps its id and takes the
 * new time. Anything else becomes a new entry, and the oldest falls off the end at
 * {@link SESSION_LOG_CAP}.
 */
export function recordGeneration(
  report: GenerationReport,
  options: SessionLogRecordOptions = {},
): SessionLogEntry {
  const config = canonicalSessionConfig(report.config);
  const at = options.now ?? Date.now();
  const key = sessionRunKey(report.toolPath, report.seed, config);
  const existing = entries.find((entry) => keyOf(entry) === key);

  const entry: SessionLogEntry =
    existing === undefined
      ? {
          id: options.id ?? newSessionLogEntryId(),
          toolPath: report.toolPath,
          ...(report.summary === undefined ? {} : { summary: report.summary }),
          seed: report.seed,
          config,
          at,
        }
      : { ...existing, at };

  entries = [entry, ...entries.filter((other) => other.id !== entry.id)].slice(0, SESSION_LOG_CAP);
  notifySessionLogChanged();
  return entry;
}

/** Every run this session, newest first. A copy, so a caller cannot reorder the log by holding it. */
export function listSessionLog(): SessionLogEntry[] {
  return [...entries];
}

/** How many runs the log is holding. What the panel asks before it decides to exist at all. */
export function sessionLogSize(): number {
  return entries.length;
}

/** Forget every run. What the Clear button does once the user has confirmed it. */
export function clearSessionLog(): void {
  entries = [];
  notifySessionLogChanged();
}
