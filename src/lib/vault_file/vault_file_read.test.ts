import { describe, expect, it, vi } from 'vitest';

import { looksGzipped, readExportFileText } from './vault_file_read';

function gzip(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

const FILE = '{"format":"ironarachne.export"}';

describe('looksGzipped', () => {
  it('is the two magic bytes and nothing else', () => {
    expect(looksGzipped(new Uint8Array([0x1f, 0x8b, 0x08]))).toBe(true);
    expect(looksGzipped(new Uint8Array([0x7b, 0x22]))).toBe(false);
    expect(looksGzipped(new Uint8Array([0x1f]))).toBe(false);
    expect(looksGzipped(new Uint8Array())).toBe(false);
  });
});

describe('readExportFileText', () => {
  it('reads a plain file as text', async () => {
    expect(await readExportFileText(new TextEncoder().encode(FILE))).toBe(FILE);
  });

  it('decompresses a gzipped file, so a compressed backup is not reported as damaged', async () => {
    expect(await readExportFileText(await gzip(FILE))).toBe(FILE);
  });

  it('sniffs rather than trusting the name, because users rename files', async () => {
    // The same bytes would be unreadable JSON if the extension were believed over the content.
    const compressed = await gzip(FILE);
    expect(looksGzipped(compressed)).toBe(true);
    expect(await readExportFileText(compressed)).toBe(FILE);
  });

  it('reports a file that claims to be gzip and is not', async () => {
    const lying = new Uint8Array([0x1f, 0x8b, 0x00, 0x01, 0x02, 0x03]);
    await expect(readExportFileText(lying)).rejects.toThrow(/compressed/);
  });

  it('says so plainly where the browser cannot decompress at all', async () => {
    vi.stubGlobal('DecompressionStream', undefined);
    try {
      await expect(readExportFileText(new Uint8Array([0x1f, 0x8b, 0x08]))).rejects.toThrow(
        /cannot read a compressed file/,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
