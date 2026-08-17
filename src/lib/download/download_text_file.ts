import downloadInBrowser from './index';

/**
 * Hand a text file to the browser, reporting whether the browser took it.
 *
 * **Reports rather than throws**, because for an export file the download *is* the product. A
 * browser that blocks it — an unusual mobile context, a restrictive extension, a pop-up rule that
 * catches programmatic anchors — must leave the caller able to offer the text some other way, and
 * a thrown error at that point looks to a user exactly like their backup failing.
 *
 * The object URL is revoked immediately after the click. The browser has already taken ownership of
 * the blob by then, and holding the URL open is a leak for however long the page lives.
 */
export function downloadTextFile(
  text: string,
  fileName: string,
  mimeType = 'application/json',
): boolean {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
    try {
      downloadInBrowser(url, fileName);
    } finally {
      URL.revokeObjectURL(url);
    }
    return true;
  } catch {
    return false;
  }
}
