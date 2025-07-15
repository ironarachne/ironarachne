export function formatNumber(value: number, precision = 2): string {
  const result = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);

  return result;
}
