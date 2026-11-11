import { beforeEach, describe, expect, it } from 'vitest';

import { getShortDate } from '$lib/dates';
import type { Project } from '$lib/projects';

import {
  buildStoragePanelView,
  dismissStorageWarning,
  exportCell,
  exportHeadline,
  exportRecency,
  formatApproximateBytes,
  hasDismissedStorageWarning,
  protectionAdvice,
  resetStorageWarningSession,
  storageWarning,
  STORAGE_WARNING_FRACTION,
  usageProportion,
  usageSentence,
} from './storage_presentation';
import type { StorageStatus } from './storage_status_types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 7, 24, 12, 0, 0);

function status(overrides: Partial<StorageStatus> = {}): StorageStatus {
  return {
    persistence: 'unknown',
    measuredAt: NOW,
    projects: [],
    ...overrides,
  };
}

function project(id: string, name: string): Project {
  return { id, name, tags: [], createdAt: 1, updatedAt: 1 };
}

describe('how long ago a thing was exported', () => {
  it('distinguishes missing exports from old ones', () => {
    const missing = exportRecency(undefined, NOW);
    const old = exportRecency(NOW - 400 * DAY, NOW);

    expect(missing).toEqual({ everExported: false });
    expect(old).toMatchObject({ everExported: true, daysAgo: 400 });
    expect(exportHeadline(missing)).not.toBe(exportHeadline(old));
    expect(exportCell(missing)).not.toBe(exportCell(old));
  });

  it('counts whole elapsed days and clamps future timestamps to today', () => {
    expect(exportRecency(NOW - 12 * DAY, NOW).daysAgo).toBe(12);
    expect(exportRecency(NOW - DAY + 1, NOW).daysAgo).toBe(0);
    expect(exportRecency(NOW + 5 * DAY, NOW)).toMatchObject({ everExported: true, daysAgo: 0 });
  });

  it('uses calendar dates starting at thirty elapsed days', () => {
    const recent = exportRecency(NOW - 29 * DAY, NOW);
    const then = NOW - 30 * DAY;
    const older = exportRecency(then, NOW);
    const date = getShortDate(new Date(then));

    expect(exportHeadline(recent)).toContain('29');
    expect(exportCell(recent)).toContain('29');
    expect(exportHeadline(older)).toContain(date);
    expect(exportCell(older)).toBe(date);
  });
});

describe('eviction advice', () => {
  it('distinguishes all three browser persistence states', () => {
    const states = ['persisted', 'notPersisted', 'unknown'] as const;
    const advice = states.map(protectionAdvice);

    expect(advice.map(({ state }) => state)).toEqual(states);
    expect(new Set(advice.map(({ headline }) => headline)).size).toBe(states.length);
    for (const { headline, meaning } of advice) {
      expect(headline.trim()).not.toBe('');
      expect(meaning.trim()).not.toBe('');
    }
  });
});

describe('a byte count at the precision an estimate has', () => {
  it('rounds a large figure to something nobody has to read twice', () => {
    expect(formatApproximateBytes(236 * 1024 * 1024)).toBe('240 MB');
  });

  it('drops the decimal place above ten, and keeps it below', () => {
    expect(formatApproximateBytes(38.2 * 1024 * 1024)).toBe('38 MB');
    expect(formatApproximateBytes(1.74 * 1024 * 1024 * 1024)).toBe('1.7 GB');
  });

  it('does not claim a decimal place that was not measured', () => {
    expect(formatApproximateBytes(2 * 1024 * 1024 * 1024)).toBe('2 GB');
  });

  it('steps through the units', () => {
    expect(formatApproximateBytes(812)).toBe('810 B');
    expect(formatApproximateBytes(4 * 1024)).toBe('4 KB');
    expect(formatApproximateBytes(3 * 1024 * 1024 * 1024 * 1024)).toBe('3 TB');
  });

  it('reports nothing as nothing rather than throwing', () => {
    expect(formatApproximateBytes(0)).toBe('0 B');
    expect(formatApproximateBytes(Number.NaN)).toBe('0 B');
    expect(formatApproximateBytes(-1)).toBe('0 B');
  });
});

describe('how full the browser says it is', () => {
  it('is a proportion only when both figures arrived', () => {
    expect(usageProportion(status({ usageBytes: 100, quotaBytes: 1000 }))).toEqual({
      known: true,
      usageBytes: 100,
      quotaBytes: 1000,
      fraction: 0.1,
    });
    expect(usageProportion(status({ usageBytes: 100 }))).toEqual({ known: false, usageBytes: 100 });
    expect(usageProportion(status())).toEqual({ known: false });
  });

  it('reports a missing figure as missing rather than as zero', () => {
    const usage = usageProportion(status({ quotaBytes: 1000 }));

    expect(usage.usageBytes).toBeUndefined();
    expect(usage.fraction).toBeUndefined();
  });

  it('does not divide by a quota of zero', () => {
    expect(usageProportion(status({ usageBytes: 10, quotaBytes: 0 })).fraction).toBeUndefined();
  });
});

describe('storage usage summary', () => {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  it.each([
    { usageBytes: 236 * MB, quotaBytes: 2 * GB, expected: ['240 MB', '2 GB', '12%'] },
    { usageBytes: 236 * MB, expected: ['240 MB'] },
    { quotaBytes: 2 * GB, expected: ['2 GB'] },
    { usageBytes: 236 * MB, quotaBytes: 0, expected: ['240 MB', '0 B'] },
    { expected: [] },
  ])(
    'shows only the available figures and a valid percentage ($expected)',
    ({ expected, ...sizes }) => {
      const sentence = usageSentence(usageProportion(status(sizes)));

      expect(sentence.trim()).not.toBe('');
      expect(sentence.match(/\d+(?:\.\d+)?(?: (?:B|KB|MB|GB|TB)|%)/g) ?? []).toEqual(expected);
    },
  );
});

describe('the whole panel view', () => {
  const built = () =>
    buildStoragePanelView(
      status({
        persistence: 'notPersisted',
        lastVaultExportAt: NOW - 12 * DAY,
        usageBytes: 100,
        quotaBytes: 1000,
        projects: [
          { projectId: 'big', artifactCount: 14, byteSize: 900, lastExportAt: NOW - 3 * DAY },
          { projectId: 'small', artifactCount: 2, byteSize: 10 },
        ],
      }),
      [project('big', 'Riverlands'), project('small', 'Hex crawl')],
      NOW,
    );

  it('leads with export recency', () => {
    expect(built().lastExport).toMatchObject({ everExported: true, daysAgo: 12 });
  });

  it('names each row from the project index', () => {
    expect(built().projects.map((row) => row.name)).toEqual(['Riverlands', 'Hex crawl']);
  });

  it('keeps the order the library sorted, largest first', () => {
    expect(built().projects.map((row) => row.projectId)).toEqual(['big', 'small']);
  });

  it('carries each project’s own export recency', () => {
    const [big, small] = built().projects;

    expect(big.lastExport).toMatchObject({ everExported: true, daysAgo: 3 });
    expect(small.lastExport).toEqual({ everExported: false });
  });

  it('still gives a row to a project the index cannot name', () => {
    const view = buildStoragePanelView(
      status({ projects: [{ projectId: 'orphan', artifactCount: 1, byteSize: 40 }] }),
      [],
      NOW,
    );

    expect(view.projects).toHaveLength(1);
    expect(view.projects[0]).toMatchObject({ projectId: 'orphan', byteSize: 40 });
    expect(view.projects[0].name.trim()).not.toBe('');
  });

  it('is useful in a browser that answers nothing about storage', () => {
    const view = buildStoragePanelView(
      status({ lastVaultExportAt: NOW - DAY, projects: [] }),
      [],
      NOW,
    );

    expect(view.lastExport).toMatchObject({ everExported: true, daysAgo: 1 });
    expect(view.protection.state).toBe('unknown');
    expect(view.usage.known).toBe(false);
  });
});

describe('when the workshop says the browser is nearly full', () => {
  beforeEach(() => {
    resetStorageWarningSession();
  });

  it('warrants a banner at exactly the threshold', () => {
    const warning = storageWarning(status({ usageBytes: 800, quotaBytes: 1000 }));

    expect(STORAGE_WARNING_FRACTION).toBe(0.8);
    expect(warning.warranted).toBe(true);
  });

  it('says nothing below the threshold', () => {
    expect(storageWarning(status({ usageBytes: 799, quotaBytes: 1000 })).warranted).toBe(false);
  });

  it('never warrants a banner on an estimate the browser would not give', () => {
    expect(storageWarning(status()).warranted).toBe(false);
    expect(storageWarning(status({ usageBytes: 900 })).warranted).toBe(false);
    expect(storageWarning(status({ quotaBytes: 1000 })).warranted).toBe(false);
  });

  it('carries the sizes the claim has to be made with', () => {
    const warning = storageWarning(
      status({ usageBytes: 1.7 * 1024 * 1024 * 1024, quotaBytes: 2 * 1024 * 1024 * 1024 }),
    );

    expect(warning.usage).toMatchObject({
      usageBytes: 1.7 * 1024 * 1024 * 1024,
      quotaBytes: 2 * 1024 * 1024 * 1024,
      fraction: 0.85,
    });
  });

  it('stays dismissed for the rest of the page’s life, and no longer', () => {
    expect(hasDismissedStorageWarning()).toBe(false);

    dismissStorageWarning();
    expect(hasDismissedStorageWarning()).toBe(true);

    // A reload is a new session, which is what the reset stands in for here.
    resetStorageWarningSession();
    expect(hasDismissedStorageWarning()).toBe(false);
  });
});
