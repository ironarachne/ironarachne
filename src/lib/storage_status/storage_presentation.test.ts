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
  it('reports never exported as a different answer from exported long ago', () => {
    expect(exportRecency(undefined, NOW)).toEqual({ everExported: false });
    expect(exportHeadline(exportRecency(undefined, NOW))).toBe('Never exported');
    expect(exportCell(exportRecency(undefined, NOW))).toBe('Never exported');
  });

  it('counts whole elapsed days', () => {
    expect(exportRecency(NOW - 12 * DAY, NOW).daysAgo).toBe(12);
    // Not yet a whole day, so not yet a day ago.
    expect(exportRecency(NOW - DAY + 1, NOW).daysAgo).toBe(0);
  });

  it('reads a timestamp from the future as today rather than as a negative', () => {
    expect(exportRecency(NOW + 5 * DAY, NOW)).toMatchObject({ everExported: true, daysAgo: 0 });
    expect(exportHeadline(exportRecency(NOW + 5 * DAY, NOW))).toBe('Last exported today');
  });

  it('phrases the first two days in words', () => {
    expect(exportHeadline(exportRecency(NOW, NOW))).toBe('Last exported today');
    expect(exportHeadline(exportRecency(NOW - DAY, NOW))).toBe('Last exported yesterday');
    expect(exportCell(exportRecency(NOW, NOW))).toBe('Today');
    expect(exportCell(exportRecency(NOW - DAY, NOW))).toBe('Yesterday');
  });

  it('counts days up to the point where a count stops meaning anything', () => {
    expect(exportHeadline(exportRecency(NOW - 12 * DAY, NOW))).toBe('Last exported 12 days ago');
    expect(exportHeadline(exportRecency(NOW - 29 * DAY, NOW))).toBe('Last exported 29 days ago');
    expect(exportCell(exportRecency(NOW - 12 * DAY, NOW))).toBe('12 days ago');
  });

  it('gives a date once the count is past thirty days', () => {
    const then = NOW - 30 * DAY;
    expect(exportHeadline(exportRecency(then, NOW))).toBe(
      `Last exported on ${getShortDate(new Date(then))}`,
    );
    expect(exportCell(exportRecency(then, NOW))).toBe(getShortDate(new Date(then)));

    const longAgo = NOW - 400 * DAY;
    expect(exportHeadline(exportRecency(longAgo, NOW))).toBe(
      `Last exported on ${getShortDate(new Date(longAgo))}`,
    );
  });
});

describe('what the panel says about eviction', () => {
  it('states each of the three answers plainly', () => {
    expect(protectionAdvice('persisted').headline).toBe(
      'This browser has agreed to keep your work.',
    );
    expect(protectionAdvice('notPersisted').headline).toBe(
      'This browser has not promised to keep your work.',
    );
    expect(protectionAdvice('unknown').headline).toBe(
      'This browser will not say whether it keeps your work.',
    );
  });

  it('never presents protection as a backup', () => {
    const protectedAdvice = protectionAdvice('persisted');

    // The one thing this copy may not do: leave a reader believing they are covered. Every branch
    // keeps the limit attached, because a "Protected" badge read as safety talks someone out of
    // the export that is their actual protection.
    expect(protectedAdvice.meaning).toMatch(/cannot help/i);
    expect(protectedAdvice.meaning).toMatch(/a file still can/i);
    expect(protectedAdvice.meaning).not.toMatch(/backed up|safe|backup/i);
  });

  it('points at exporting when the browser has not promised, and when it will not say', () => {
    expect(protectionAdvice('notPersisted').meaning).toMatch(/Exporting is what makes that/);
    expect(protectionAdvice('unknown').meaning).toMatch(/Exporting is what makes that/);
  });

  it('carries the state it was asked about', () => {
    expect(protectionAdvice('notPersisted').state).toBe('notPersisted');
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

describe('the sentence that is the only place a percentage exists', () => {
  it('gives the sizes and the percentage together', () => {
    const sentence = usageSentence(
      usageProportion(
        status({ usageBytes: 236 * 1024 * 1024, quotaBytes: 2 * 1024 * 1024 * 1024 }),
      ),
    );

    expect(sentence).toBe('Using about 240 MB of roughly 2 GB — about 12%.');
  });

  it('never gives a percentage without both sizes beside it', () => {
    const cases = [
      status({ usageBytes: 1, quotaBytes: 2 }),
      status({ usageBytes: 900 * 1024 * 1024, quotaBytes: 1024 * 1024 * 1024 }),
      status({ usageBytes: 5 }),
      status({ quotaBytes: 5 }),
      status(),
      status({ usageBytes: 10, quotaBytes: 0 }),
    ];

    // The rule is structural rather than a convention a template can forget: one function emits
    // both, so there is no arrangement of the UI that can show the percentage on its own.
    for (const each of cases) {
      const usage = usageProportion(each);
      const sentence = usageSentence(usage);
      if (!sentence.includes('%')) {
        continue;
      }
      expect(sentence).toContain(formatApproximateBytes(usage.usageBytes ?? -1));
      expect(sentence).toContain(formatApproximateBytes(usage.quotaBytes ?? -1));
    }
  });

  it('says what it knows when only one figure arrived', () => {
    expect(usageSentence(usageProportion(status({ usageBytes: 240 * 1024 * 1024 })))).toBe(
      'Using about 240 MB. This browser will not say how much room there is in total.',
    );
    expect(usageSentence(usageProportion(status({ quotaBytes: 2 * 1024 * 1024 * 1024 })))).toBe(
      'This browser has roughly 2 GB for this site, and will not say how much of it is in use.',
    );
  });

  it('says the browser will not answer rather than reporting zero', () => {
    const sentence = usageSentence(usageProportion(status()));

    expect(sentence).toBe('This browser will not say how much room this site is using.');
    expect(sentence).not.toContain('0');
  });
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
    expect(exportHeadline(built().lastExport)).toBe('Last exported 12 days ago');
  });

  it('names each row from the project index', () => {
    expect(built().projects.map((row) => row.name)).toEqual(['Riverlands', 'Hex crawl']);
  });

  it('keeps the order the library sorted, largest first', () => {
    expect(built().projects.map((row) => row.projectId)).toEqual(['big', 'small']);
  });

  it('carries each project’s own export recency', () => {
    const [big, small] = built().projects;

    expect(exportCell(big.lastExport)).toBe('3 days ago');
    expect(exportCell(small.lastExport)).toBe('Never exported');
  });

  it('still gives a row to a project the index cannot name', () => {
    const view = buildStoragePanelView(
      status({ projects: [{ projectId: 'orphan', artifactCount: 1, byteSize: 40 }] }),
      [],
      NOW,
    );

    expect(view.projects).toHaveLength(1);
    expect(view.projects[0]).toMatchObject({ name: 'Unnamed project', byteSize: 40 });
  });

  it('is useful in a browser that answers nothing about storage', () => {
    const view = buildStoragePanelView(
      status({ lastVaultExportAt: NOW - DAY, projects: [] }),
      [],
      NOW,
    );

    expect(exportHeadline(view.lastExport)).toBe('Last exported yesterday');
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

    expect(usageSentence(warning.usage)).toBe('Using about 1.7 GB of roughly 2 GB — about 85%.');
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
