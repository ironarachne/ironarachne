import { describe, expect, it } from 'vitest';

import { payloadByteSize } from './vault_payload_size';

describe('payloadByteSize', () => {
  it('measures the JSON form in bytes, not characters', () => {
    expect(payloadByteSize({ name: 'Ashfall' })).toBe(18);
    // Three bytes of UTF-8 apiece, which is the point of measuring bytes.
    expect(payloadByteSize('日本')).toBe('"日本"'.length + 4);
  });

  it('measures a payload with nothing in it as nothing', () => {
    expect(payloadByteSize(undefined)).toBe(0);
  });

  it('measures a payload that cannot be serialised as zero rather than throwing', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    // A size is a number for a panel to display; it is never a reason to refuse to store work.
    expect(payloadByteSize(circular)).toBe(0);
  });
});
