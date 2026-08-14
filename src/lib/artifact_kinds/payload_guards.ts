/**
 * The checks every `validate` needs before it can look at anything kind-specific. They live here
 * rather than in each library because a stored payload is `unknown` in exactly the same way for
 * all of them, and three private copies of "is this an object" is how the three drift.
 */

/** The value as a plain object, or `null` for anything else — arrays and `null` included. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

export function isStringArrayArray(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray);
}

/** True when every named key holds a string. Absent and wrong-typed both fail. */
export function hasStringFields(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof record[key] === 'string');
}

/** The message from a thrown value, for turning a rehydration failure into a rejection. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
