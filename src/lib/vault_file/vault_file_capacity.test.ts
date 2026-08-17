import { afterEach, describe, expect, it, vi } from 'vitest';

import { invalidateStorageMeasurement } from '$lib/storage_status';

import { checkImportCapacity, IMPORT_SIZE_MULTIPLIER } from './vault_file_capacity';

function withEstimate(estimate: { usage?: number; quota?: number } | null): void {
  invalidateStorageMeasurement();
  vi.stubGlobal(
    'navigator',
    estimate === null ? {} : { storage: { estimate: () => Promise.resolve(estimate) } },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateStorageMeasurement();
});

describe('checkImportCapacity', () => {
  it('passes when there is room, and says how much it needs', async () => {
    withEstimate({ usage: 0, quota: 10_000_000 });
    const check = await checkImportCapacity(1000);
    expect(check.ok).toBe(true);
    expect(check.requiredBytes).toBe(1000 * IMPORT_SIZE_MULTIPLIER);
  });

  it('refuses when the import would not fit, in megabytes a user can act on', async () => {
    withEstimate({ usage: 9_000_000, quota: 10_000_000 });
    const check = await checkImportCapacity(5_000_000);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.message).toMatch(/needs about 7\.2 MB/);
      expect(check.message).toMatch(/about 1\.0 MB left/);
      expect(check.message).toMatch(/Nothing was changed/);
    }
  });

  it('keeps headroom back, so an import cannot fill storage to the brim', async () => {
    // Exactly enough room for the raw bytes, and not enough once the browser's own overhead is
    // allowed for — a vault filled to the quota cannot save the next thing the user makes.
    withEstimate({ usage: 0, quota: 1000 });
    expect((await checkImportCapacity(1000)).ok).toBe(false);
  });

  it('passes when the browser will not say, because an unknown quota is not a refusal', async () => {
    withEstimate(null);
    expect((await checkImportCapacity(50_000_000)).ok).toBe(true);

    withEstimate({ usage: 5 });
    expect((await checkImportCapacity(50_000_000)).ok).toBe(true);
  });
});
