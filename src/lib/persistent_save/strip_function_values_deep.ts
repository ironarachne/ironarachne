/** Removes function-valued properties for JSON-safe persistence of nested objects. */
export function stripFunctionValuesDeep(value: unknown): unknown {
  if (typeof value === 'function') {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripFunctionValuesDeep(item));
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'function') {
      continue;
    }
    out[key] = stripFunctionValuesDeep(child);
  }
  return out;
}
