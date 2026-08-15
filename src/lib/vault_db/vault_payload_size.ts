const encoder = new TextEncoder();

/**
 * How many bytes a payload takes, recorded on the summary at write time.
 *
 * Write time is the one moment the number is free (docs/workshop.md, "The storage layer"), and
 * having it on the summary is what lets the storage panel attribute usage to a project without
 * reading a single payload back — something `navigator.storage.estimate()` cannot do, because it
 * reports for the whole origin.
 *
 * It is the JSON size in UTF-8 bytes, which is an approximation and is meant to be: IndexedDB
 * stores a structured clone rather than a string, and the browser's own overhead is not visible
 * from in here. It is attribution — which project is large — not an accounting of the origin.
 * A payload that cannot be serialised measures zero rather than throwing, because a size is never
 * a reason to refuse to store something.
 */
export function payloadByteSize(payload: unknown): number {
  try {
    const json = JSON.stringify(payload);
    return json === undefined ? 0 : encoder.encode(json).length;
  } catch {
    return 0;
  }
}
