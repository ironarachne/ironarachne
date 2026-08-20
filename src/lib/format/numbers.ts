export function formatNumber(value: number, precision = 2): string {
  const result = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);

  return result;
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/**
 * A byte count as something a person can read: `0 B`, `812 B`, `4.2 KB`, `1.1 MB`.
 *
 * Binary units — 1024 to the step — because this measures browser storage, which is what
 * `navigator.storage.estimate()` reports in and what a quota is expressed in.
 *
 * One decimal place above a kilobyte and none below it. The exact byte count of a saved culture
 * is not a number anyone acts on; the difference between 4 KB and 4 MB is.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  const rounded = unit === 0 ? Math.round(value).toString() : value.toFixed(1);
  return `${rounded} ${BYTE_UNITS[unit]}`;
}
