/**
 * Turning the bytes a user picked into the text a parser reads.
 *
 * Separate from parsing because "what kind of file is this?" is answered by the first two bytes,
 * before anything about the format is in play — and because import has to sniff rather than trust a
 * name. A user renames files, a browser mislabels a download, and `.json` on the end of a gzipped
 * file is not a reason to hand a parser binary.
 */

/** The gzip magic number. Two bytes is the whole test; there is nothing else it can be. */
const GZIP_MAGIC = [0x1f, 0x8b];

export function looksGzipped(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === GZIP_MAGIC[0] && bytes[1] === GZIP_MAGIC[1];
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

/**
 * A picked file as text, decompressing it when it turns out to be gzipped.
 *
 * Compressed export files are [deferred, not designed away](../../../docs/workshop.md#failure-states):
 * this build never writes one. Reading them anyway is what makes writing them a non-event later —
 * a user who compresses a backup themselves, or restores one written by a future build, is not
 * told their file is damaged. It costs the two-byte check above.
 *
 * A file that claims to be gzip and will not decompress is **damaged**, and reads as such: raising
 * the stream's own error here would surface a `DecompressionStream` failure to someone who only
 * knows they picked a file.
 */
export async function readExportFileText(bytes: Uint8Array): Promise<string> {
  if (!looksGzipped(bytes)) {
    return new TextDecoder().decode(bytes);
  }
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('this browser cannot read a compressed file');
  }
  try {
    return await gunzip(bytes);
  } catch {
    throw new Error('this file is compressed and could not be decompressed');
  }
}
