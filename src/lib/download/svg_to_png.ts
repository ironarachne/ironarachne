import downloadInBrowser from '$lib/download';

/**
 * Rasterizes an SVG string to a PNG and saves it.
 *
 * It lived in `$lib/renderers` until step 6 of `docs/renderers.md`, on no better grounds than that
 * heraldry needed it. It is a download utility that takes a picture on the way, so it belongs
 * beside the other one.
 *
 * Two things are fixed in the move, both of which the design document names:
 *
 * - **The object URL is revoked.** It used to leak one blob per call, held for the life of the
 *   document — an SVG the size of a coat of arms, every time someone pressed save.
 * - **Failure reaches the caller.** The work happens in an `onload` handler, so the `throw` that
 *   used to be in there unwound into the event loop where nothing could catch it. Returning a
 *   promise is what makes "the canvas gave us no context" and "that string was not an image"
 *   answerable by whoever asked for the download.
 */
export default function saveSvgAsPng(
  svg: string,
  width: number,
  height: number,
  fileName: string,
): Promise<void> {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const blobUrl = window.URL.createObjectURL(blob);

  return new Promise<void>((resolve, reject) => {
    const image = new Image();

    // Revoked on every path out of here, before the promise settles, so no exit leaves the blob
    // behind — including the ones that fail.
    const release = () => window.URL.revokeObjectURL(blobUrl);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (context === null) {
        canvas.remove();
        release();
        reject(new Error('Could not get 2D context'));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      const png = canvas.toDataURL();
      canvas.remove();
      release();

      downloadInBrowser(png, fileName);
      resolve();
    };

    image.onerror = () => {
      release();
      reject(new Error(`Could not load the SVG for ${fileName}`));
    };

    image.src = blobUrl;
  });
}
