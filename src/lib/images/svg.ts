import { convert } from 'xmlbuilder2';

export function renderSVGAsPNG(svg: string, width: number, height: number, outputId: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const output = document.getElementById(outputId);

  // This is a hack to get around the fact that the first time this runs, the output element is null
  if (output === null) {
    setTimeout(() => {
      renderSVGAsPNG(svg, width, height, outputId);
    }, 50);
    return;
  }

  if (!(output instanceof HTMLImageElement)) {
    throw new Error(`element with id "${outputId}" is not an HTMLImageElement`);
  }

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const blobURL = window.URL.createObjectURL(blob);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    throw new Error('failed to get canvas 2D context');
  }

  const outputImage = new Image();

  outputImage.onload = function () {
    ctx.drawImage(outputImage, 0, 0);
    const pngDataUrl = canvas.toDataURL('image/png');
    output.src = pngDataUrl;
  };

  outputImage.src = blobURL;
}

/**
 * A node in the plain-object form of parsed XML that xmlbuilder2 produces with
 * `format: 'object'`. Attributes appear as `@`-prefixed properties; child elements appear as
 * nested nodes, or arrays of nodes where a tag repeats.
 *
 * Attribute values are strings when parsed, but callers also assign numbers back before
 * re-serialising (xmlbuilder2 stringifies them on output), so both are permitted.
 */
export type XmlObjectNode = {
  [key: string]: string | number | XmlObjectNode | (string | number | XmlObjectNode)[] | undefined;
};

/** A parsed SVG document, guaranteed by `convertXmlToSVGObject` to have an `svg` root. */
export type ParsedSvgDocument = XmlObjectNode & { svg: XmlObjectNode };

export function convertXmlToSVGObject(xml: string): ParsedSvgDocument {
  const xmlObject = convert(xml, { format: 'object' }) as XmlObjectNode;

  if (!Object.hasOwn(xmlObject, 'svg')) {
    throw new Error(`invalid charge SVG: missing <svg> root element: (${xml})`);
  }

  return xmlObject as ParsedSvgDocument;
}

function readAttribute(node: XmlObjectNode, name: string): string | undefined {
  const value = node[name];
  return typeof value === 'string' ? value : undefined;
}

export function getSVGDimensions(svgObj: XmlObjectNode): { width: number; height: number } {
  let width = Number(readAttribute(svgObj, '@width') ?? 0);
  let height = Number(readAttribute(svgObj, '@height') ?? 0);

  const viewBoxAttr = readAttribute(svgObj, '@viewBox');

  if ((width === 0 || height === 0 || isNaN(width) || isNaN(height)) && viewBoxAttr) {
    const viewBox = viewBoxAttr.split(/[\s,]+/);
    if (viewBox.length === 4) {
      width = Number(viewBox[2]);
      height = Number(viewBox[3]);
    }
  }

  return { width, height };
}
