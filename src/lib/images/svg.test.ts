import { expect, describe, it, afterEach, vi } from 'vitest';
import { convertXmlToSVGObject, getSVGDimensions, renderSVGAsPNG } from './svg';
import type { XmlObjectNode } from './svg';

describe('convertXmlToSVGObject', () => {
  it('parses an SVG document into an object with an svg root', () => {
    const parsed = convertXmlToSVGObject('<svg width="10" height="20"></svg>');

    expect(parsed.svg['@width']).toBe('10');
    expect(parsed.svg['@height']).toBe('20');
  });

  it('exposes child elements as nested nodes', () => {
    const parsed = convertXmlToSVGObject('<svg><path d="M0 0 L1 1"/></svg>');
    const path = parsed.svg.path as XmlObjectNode;

    expect(path['@d']).toBe('M0 0 L1 1');
  });

  it('exposes a repeated tag as an array of nodes', () => {
    const parsed = convertXmlToSVGObject('<svg><path d="a"/><path d="b"/></svg>');
    const paths = parsed.svg.path as XmlObjectNode[];

    expect(Array.isArray(paths)).toBe(true);
    expect(paths.map((path) => path['@d'])).toEqual(['a', 'b']);
  });

  it('parses an SVG carrying an XML declaration', () => {
    const parsed = convertXmlToSVGObject('<?xml version="1.0"?><svg viewBox="0 0 4 5"></svg>');

    expect(parsed.svg['@viewBox']).toBe('0 0 4 5');
  });

  it('throws when the root element is not svg', () => {
    expect(() => convertXmlToSVGObject('<html></html>')).toThrow(
      /invalid charge SVG: missing <svg> root element/,
    );
  });

  it('includes the offending XML in the error message', () => {
    expect(() => convertXmlToSVGObject('<nope/>')).toThrow('<nope/>');
  });

  it('lets the parser reject input that is not XML', () => {
    expect(() => convertXmlToSVGObject('not xml')).toThrow(/Invalid XML name/);
  });
});

describe('getSVGDimensions', () => {
  it('reads the width and height attributes', () => {
    expect(getSVGDimensions({ '@width': '120', '@height': '80' })).toEqual({
      width: 120,
      height: 80,
    });
  });

  it('falls back to the viewBox when width and height are absent', () => {
    expect(getSVGDimensions({ '@viewBox': '0 0 200 100' })).toEqual({ width: 200, height: 100 });
  });

  it('falls back to the viewBox when width is zero', () => {
    expect(getSVGDimensions({ '@width': '0', '@height': '50', '@viewBox': '0 0 200 100' })).toEqual(
      {
        width: 200,
        height: 100,
      },
    );
  });

  it('falls back to the viewBox when height is zero', () => {
    expect(getSVGDimensions({ '@width': '50', '@height': '0', '@viewBox': '0 0 200 100' })).toEqual(
      {
        width: 200,
        height: 100,
      },
    );
  });

  it('falls back to the viewBox when a dimension is not a number', () => {
    expect(getSVGDimensions({ '@width': 'wide', '@height': '10', '@viewBox': '0 0 7 9' })).toEqual({
      width: 7,
      height: 9,
    });
  });

  it('accepts a comma-separated viewBox', () => {
    expect(getSVGDimensions({ '@viewBox': '0,0,300,150' })).toEqual({ width: 300, height: 150 });
  });

  it('accepts a viewBox with irregular whitespace', () => {
    expect(getSVGDimensions({ '@viewBox': '0  0\t300\n150' })).toEqual({ width: 300, height: 150 });
  });

  it('uses the viewBox width and height, not its origin', () => {
    expect(getSVGDimensions({ '@viewBox': '10 20 30 40' })).toEqual({ width: 30, height: 40 });
  });

  it('ignores a viewBox that does not have four parts', () => {
    expect(getSVGDimensions({ '@viewBox': '0 0 300' })).toEqual({ width: 0, height: 0 });
  });

  it('returns zeroes when there is nothing to read', () => {
    expect(getSVGDimensions({})).toEqual({ width: 0, height: 0 });
  });

  it('ignores a non-string width, since only parsed attributes count', () => {
    expect(getSVGDimensions({ '@width': 42, '@height': 42 })).toEqual({ width: 0, height: 0 });
  });

  it('prefers explicit dimensions over the viewBox', () => {
    expect(
      getSVGDimensions({ '@width': '10', '@height': '20', '@viewBox': '0 0 999 999' }),
    ).toEqual({ width: 10, height: 20 });
  });
});

/**
 * `renderSVGAsPNG` is browser code, and the unit suite runs in Node with no DOM. These stubs
 * stand in for the handful of DOM APIs it touches, so its branches stay covered without
 * pulling in a DOM implementation as a dependency.
 */
class FakeImageElement {
  src = '';
}

class FakeLoadingImage {
  onload: (() => void) | null = null;
  #src = '';

  get src(): string {
    return this.#src;
  }

  // Assigning a source is what triggers a load in a real browser; fire it synchronously here.
  set src(value: string) {
    this.#src = value;
    this.onload?.();
  }
}

type CanvasStub = {
  width: number;
  height: number;
  getContext: () => { drawImage: (image: unknown) => void } | null;
  toDataURL: () => string;
};

function stubDom(options: { element: unknown; context?: unknown } = { element: null }) {
  const drawn: unknown[] = [];
  const canvas: CanvasStub = {
    width: 0,
    height: 0,
    getContext: () =>
      options.context === undefined
        ? { drawImage: (image: unknown) => void drawn.push(image) }
        : (options.context as null),
    toDataURL: () => 'data:image/png;base64,PNG',
  };

  vi.stubGlobal('HTMLImageElement', FakeImageElement);
  vi.stubGlobal('Image', FakeLoadingImage);
  vi.stubGlobal('document', {
    getElementById: () => options.element,
    createElement: () => canvas,
  });
  vi.stubGlobal('window', { URL: { createObjectURL: () => 'blob:svg' } });

  return { canvas, drawn };
}

describe('renderSVGAsPNG', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('does nothing when there is no document, as on the server', () => {
    expect(() => renderSVGAsPNG('<svg/>', 10, 10, 'out')).not.toThrow();
  });

  it('draws the SVG onto a canvas and assigns the PNG to the output image', () => {
    const output = new FakeImageElement();
    const { canvas, drawn } = stubDom({ element: output });

    renderSVGAsPNG('<svg/>', 64, 32, 'out');

    expect(output.src).toBe('data:image/png;base64,PNG');
    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(32);
    expect(drawn).toHaveLength(1);
  });

  it('throws when the target element is not an image', () => {
    stubDom({ element: { nodeName: 'DIV' } });

    expect(() => renderSVGAsPNG('<svg/>', 10, 10, 'out')).toThrow(
      'element with id "out" is not an HTMLImageElement',
    );
  });

  it('throws when the canvas has no 2D context', () => {
    stubDom({ element: new FakeImageElement(), context: null });

    expect(() => renderSVGAsPNG('<svg/>', 10, 10, 'out')).toThrow(
      'failed to get canvas 2D context',
    );
  });

  it('retries later when the output element is not in the document yet', () => {
    vi.useFakeTimers();
    const output = new FakeImageElement();
    let element: unknown = null;

    vi.stubGlobal('HTMLImageElement', FakeImageElement);
    vi.stubGlobal('Image', FakeLoadingImage);
    vi.stubGlobal('document', {
      getElementById: () => element,
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: () => {} }),
        toDataURL: () => 'data:image/png;base64,PNG',
      }),
    });
    vi.stubGlobal('window', { URL: { createObjectURL: () => 'blob:svg' } });

    renderSVGAsPNG('<svg/>', 10, 10, 'out');
    expect(output.src).toBe('');

    element = output;
    vi.advanceTimersByTime(50);

    expect(output.src).toBe('data:image/png;base64,PNG');
  });
});
