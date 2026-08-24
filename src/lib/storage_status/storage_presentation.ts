import { getShortDate } from '$lib/dates';
import type { Project } from '$lib/projects';

import type {
  ExportRecency,
  PersistenceState,
  ProjectStorageRow,
  ProtectionAdvice,
  StoragePanelView,
  StorageStatus,
  StorageWarning,
  UsageProportion,
} from './storage_status_types';

/**
 * Turning what the browser reported into what a reader is told.
 *
 * This is presentation, and it is in the library rather than in the `.svelte` files on purpose: the
 * rules docs/storage-panel.md argues for — a quota is never exact, a percentage never appears
 * without its sizes, unknown never renders as zero — are only worth anything if they are tested,
 * and components here have no unit tests. Nothing in this file draws; it returns strings and
 * numbers.
 */

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * How long ago an export stops being counted in days.
 *
 * Beyond this the panel gives the date instead. A hundred and forty days ago is a number nobody
 * converts into anything, where a date is something a reader can place against their own memory.
 */
export const RECENT_EXPORT_DAYS = 30;

/** The share of the estimate at which the workshop says something. See {@link storageWarning}. */
export const STORAGE_WARNING_FRACTION = 0.8;

const APPROXIMATE_BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Round a figure to about as much precision as an estimate deserves: `240`, `38`, `1.7`, `2`.
 *
 * Three bands, because the useful precision changes with the magnitude. Nobody acts on the
 * difference between 236 MB and 240 MB, everybody acts on the difference between 1.7 GB and 17 GB,
 * and a trailing `.0` claims a decimal place that was not measured.
 */
function roundedMagnitude(value: number): string {
  if (value >= 100) {
    return (Math.round(value / 10) * 10).toString();
  }
  if (value >= 10) {
    return Math.round(value).toString();
  }
  const oneDecimal = Math.round(value * 10) / 10;
  return Number.isInteger(oneDecimal) ? oneDecimal.toString() : oneDecimal.toFixed(1);
}

/**
 * A byte count from `navigator.storage.estimate()` at the precision it actually has: `240 MB`,
 * `2 GB`, `1.7 GB`.
 *
 * **Deliberately not in `$lib/format` beside `formatBytes`.** Its rule is about the storage
 * estimate specifically — browsers fuzz what they report, so rendering it to the byte is a claim
 * the code cannot support — and a general-purpose home would invite it onto figures that are
 * exact, like the sum of an artifact's recorded sizes, where `formatBytes`'s decimal place is
 * correct.
 *
 * The hedging word is not included. Callers say "about" or "roughly" as their sentence needs, and
 * a formatter that carried one would produce "about about 2 GB" the first time it was composed.
 */
export function formatApproximateBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < APPROXIMATE_BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${roundedMagnitude(value)} ${APPROXIMATE_BYTE_UNITS[unit]}`;
}

/**
 * How long ago something was exported, or that it never was.
 *
 * A timestamp in the future is clamped to today rather than reported as a negative number of days:
 * a corrected clock is not a reason to tell someone their backup happens tomorrow.
 */
export function exportRecency(
  lastExportAt: number | undefined,
  now: number = Date.now(),
): ExportRecency {
  if (lastExportAt === undefined || !Number.isFinite(lastExportAt)) {
    return { everExported: false };
  }
  const daysAgo = Math.max(0, Math.floor((now - lastExportAt) / MILLISECONDS_PER_DAY));
  return { everExported: true, lastExportAt, daysAgo };
}

/** The elapsed part on its own: `today`, `yesterday`, `12 days ago`, or a date. */
function elapsedPhrase(recency: ExportRecency): string {
  const daysAgo = recency.daysAgo ?? 0;
  if (daysAgo === 0) {
    return 'today';
  }
  if (daysAgo === 1) {
    return 'yesterday';
  }
  if (daysAgo < RECENT_EXPORT_DAYS) {
    return `${daysAgo} days ago`;
  }
  return `on ${getShortDate(new Date(recency.lastExportAt ?? 0))}`;
}

/**
 * The panel's leading line: `Never exported`, `Last exported today`, `Last exported 12 days ago`.
 *
 * This is what the panel opens with, and it opens with it because export recency predicts loss
 * where fullness only predicts inconvenience (docs/storage-panel.md). It states; it does not alarm.
 */
export function exportHeadline(recency: ExportRecency): string {
  if (!recency.everExported) {
    return 'Never exported';
  }
  return `Last exported ${elapsedPhrase(recency)}`;
}

/** The same fact as a table cell: `Never exported`, `Today`, `12 days ago`, `3 Jun 2026`. */
export function exportCell(recency: ExportRecency): string {
  if (!recency.everExported) {
    return 'Never exported';
  }
  const phrase = elapsedPhrase(recency);
  const shown = phrase.startsWith('on ') ? phrase.slice(3) : phrase;
  return `${shown.charAt(0).toUpperCase()}${shown.slice(1)}`;
}

/**
 * What each persistence state means, in words that never sell a guarantee the product cannot
 * honour.
 *
 * All three end on the same place, because the honest position is the same in every branch and in
 * every browser: a file is the protection. That is also why there is no user-agent check anywhere
 * near this — there is nothing a browser name would change.
 */
const PROTECTION_COPY: Record<PersistenceState, Omit<ProtectionAdvice, 'state'>> = {
  persisted: {
    headline: 'This browser has agreed to keep your work.',
    meaning:
      'It will not clear this site to make room for another. It cannot help if you clear it yourself, or if this machine is lost — a file still can.',
  },
  notPersisted: {
    headline: 'This browser has not promised to keep your work.',
    meaning:
      'It may clear this site to make room for others, without asking. Exporting is what makes that survivable.',
  },
  unknown: {
    headline: 'This browser will not say whether it keeps your work.',
    meaning:
      'Nothing is wrong; it does not answer the question. Exporting is what makes that survivable.',
  },
};

export function protectionAdvice(state: PersistenceState): ProtectionAdvice {
  return { state, ...PROTECTION_COPY[state] };
}

/**
 * The usage figures, and whether they amount to a proportion.
 *
 * `known` needs both. One figure without the other is kept and reported rather than completed with
 * a zero — zero is a claim, and the claim would be false.
 */
export function usageProportion(status: StorageStatus): UsageProportion {
  const { usageBytes, quotaBytes } = status;
  const usage: UsageProportion = { known: usageBytes !== undefined && quotaBytes !== undefined };
  if (usageBytes !== undefined) {
    usage.usageBytes = usageBytes;
  }
  if (quotaBytes !== undefined) {
    usage.quotaBytes = quotaBytes;
  }
  if (usageBytes !== undefined && quotaBytes !== undefined && quotaBytes > 0) {
    usage.fraction = usageBytes / quotaBytes;
  }
  return usage;
}

/**
 * The one place a percentage is allowed to exist.
 *
 * The rule from docs/workshop.md is that a percentage never appears without the sizes underneath
 * it, and this function is how that rule is enforced: both come out of it in a single string, so
 * there is no arrangement of a template that can show one without the other. Every branch says what
 * is known and nothing more — a browser that will not answer is reported as not answering, never as
 * a site using zero bytes.
 */
export function usageSentence(usage: UsageProportion): string {
  const { usageBytes, quotaBytes, fraction } = usage;
  if (usageBytes !== undefined && quotaBytes !== undefined) {
    const used = formatApproximateBytes(usageBytes);
    const total = formatApproximateBytes(quotaBytes);
    if (fraction === undefined) {
      return `Using about ${used} of roughly ${total}.`;
    }
    return `Using about ${used} of roughly ${total} — about ${Math.round(fraction * 100)}%.`;
  }
  if (usageBytes !== undefined) {
    return `Using about ${formatApproximateBytes(usageBytes)}. This browser will not say how much room there is in total.`;
  }
  if (quotaBytes !== undefined) {
    return `This browser has roughly ${formatApproximateBytes(quotaBytes)} for this site, and will not say how much of it is in use.`;
  }
  return 'This browser will not say how much room this site is using.';
}

/** The name a row falls back to when the project index cannot name it. */
const UNNAMED_PROJECT = 'Unnamed project';

/**
 * Everything the panel renders, from the status and the project index.
 *
 * The row order is `summarizeProjectUsage`'s — largest first, because "which one is big" is the
 * question the table is actually asked — and it is not re-derived here. A project the index cannot
 * name still gets a row: the bytes are real whether or not the name arrived, and dropping the row
 * would make the total disagree with the parts for no reason the reader can see.
 */
export function buildStoragePanelView(
  status: StorageStatus,
  projects: Project[],
  now: number = Date.now(),
): StoragePanelView {
  const names = new Map(projects.map((project) => [project.id, project.name]));
  const rows: ProjectStorageRow[] = status.projects.map((usage) => ({
    projectId: usage.projectId,
    name: names.get(usage.projectId) ?? UNNAMED_PROJECT,
    artifactCount: usage.artifactCount,
    byteSize: usage.byteSize,
    lastExport: exportRecency(usage.lastExportAt, now),
  }));

  return {
    lastExport: exportRecency(status.lastVaultExportAt, now),
    protection: protectionAdvice(status.persistence),
    usage: usageProportion(status),
    projects: rows,
  };
}

/**
 * Whether the workshop should say the browser is nearly full.
 *
 * Only a known proportion can warrant it. A browser that will not answer is not eighty per cent of
 * anything, and warning someone about a risk the code cannot demonstrate is how a storage display
 * teaches people to ignore it.
 */
export function storageWarning(status: StorageStatus): StorageWarning {
  const usage = usageProportion(status);
  const warranted = usage.fraction !== undefined && usage.fraction >= STORAGE_WARNING_FRACTION;
  return { warranted, usage };
}

/**
 * Whether the banner has been dismissed since this page loaded.
 *
 * Module state, so a session is the page's lifetime — the same reading of "session" the persistence
 * request takes, and for the same reason: `sessionStorage` would buy a stricter one at the price of
 * a mechanism this codebase does not have. A reload brings the banner back, which is correct. The
 * condition is still true, and the cost is one click on a statement that has not stopped being
 * accurate.
 *
 * Nothing here is persisted. A permanently silenced warning about a real condition is worse than no
 * warning, because it is a promise that the product will speak up and then does not.
 */
let warningDismissedThisSession = false;

export function hasDismissedStorageWarning(): boolean {
  return warningDismissedThisSession;
}

export function dismissStorageWarning(): void {
  warningDismissedThisSession = true;
}

/** Forget the dismissal. For tests; the application has no reason to un-dismiss anything. */
export function resetStorageWarningSession(): void {
  warningDismissedThisSession = false;
}
