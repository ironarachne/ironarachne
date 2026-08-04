import { afterEach, describe, expect, it, vi } from 'vitest';
import saveSvgAsPng from './svg_to_png';

/**
 * Stubs the browser this module talks to: a blob URL factory, an `Image` whose load can be driven
 * from the test, a canvas, and the anchor `downloadInBrowser` clicks. The project has no DOM
 * environment for Vitest, so this follows `download.test.ts` next door rather than pulling in
 * jsdom — and the things worth asserting here are the calls, not a real rasterization.
 */
type FakeImage = {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
};

function stubBrowser({ contextAvailable = true } = {}) {
  const events: string[] = [];
  const created: string[] = [];
  const revoked: string[] = [];
  const drawn: number[][] = [];
  const images: FakeImage[] = [];
  const anchor = {
    download: '',
    href: '',
    style: { opacity: '' },
    click: () => {},
    remove: () => {},
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => {
      if (!contextAvailable) return null;
      return {
        drawImage: (_image: unknown, x: number, y: number, w: number, h: number) => {
          drawn.push([x, y, w, h]);
          events.push('drawImage');
        },
      };
    },
    toDataURL: () => 'data:image/png;base64,PNG',
    remove: () => events.push('canvas.remove'),
  };

  vi.stubGlobal(
    'Blob',
    class {
      constructor(
        public parts: unknown[],
        public options: unknown,
      ) {}
    },
  );
  vi.stubGlobal(
    'Image',
    class {
      src = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() {
        images.push(this as unknown as FakeImage);
      }
    },
  );
  vi.stubGlobal('window', {
    URL: {
      createObjectURL: () => {
        events.push('createObjectURL');
        return 'blob:arms';
      },
      revokeObjectURL: (url: string) => {
        events.push('revokeObjectURL');
        revoked.push(url);
      },
    },
  });
  vi.stubGlobal('document', {
    createElement: (tag: string) => {
      created.push(tag);
      return tag === 'canvas' ? canvas : anchor;
    },
    body: { append: () => events.push('anchor.append') },
  });

  return {
    events,
    created,
    revoked,
    drawn,
    canvas,
    anchor,
    image: () => images[0],
  };
}

describe('saveSvgAsPng', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('draws the SVG at the size it was given and downloads the PNG', async () => {
    const dom = stubBrowser();
    const saved = saveSvgAsPng('<svg />', 600, 660, 'heraldry-abc.png');

    dom.image().onload?.();
    await expect(saved).resolves.toBeUndefined();

    expect(dom.image().src).toBe('blob:arms');
    expect(dom.canvas.width).toBe(600);
    expect(dom.canvas.height).toBe(660);
    expect(dom.drawn).toEqual([[0, 0, 600, 660]]);
    expect(dom.anchor.href).toBe('data:image/png;base64,PNG');
    expect(dom.anchor.download).toBe('heraldry-abc.png');
  });

  it('revokes the object URL it made', async () => {
    // It leaked one blob per call before the move: an SVG the size of a coat of arms, held for the
    // life of the document, every time someone pressed save.
    const dom = stubBrowser();
    const saved = saveSvgAsPng('<svg />', 10, 10, 'a.png');

    dom.image().onload?.();
    await saved;

    expect(dom.revoked).toEqual(['blob:arms']);
  });

  it('cleans up the canvas it made', async () => {
    const dom = stubBrowser();
    const saved = saveSvgAsPng('<svg />', 10, 10, 'a.png');

    dom.image().onload?.();
    await saved;

    expect(dom.events).toContain('canvas.remove');
  });

  it('rejects, rather than throwing where nobody can catch it, when there is no context', async () => {
    // This used to `throw` inside the image's `onload`, which unwound into the event loop.
    const dom = stubBrowser({ contextAvailable: false });
    const saved = saveSvgAsPng('<svg />', 10, 10, 'a.png');

    dom.image().onload?.();

    await expect(saved).rejects.toThrow('Could not get 2D context');
    expect(dom.revoked).toEqual(['blob:arms']);
  });

  it('rejects when the SVG will not load, and still releases the blob', async () => {
    const dom = stubBrowser();
    const saved = saveSvgAsPng('not an svg', 10, 10, 'arms.png');

    dom.image().onerror?.();

    await expect(saved).rejects.toThrow('Could not load the SVG for arms.png');
    expect(dom.revoked).toEqual(['blob:arms']);
    // Nothing was drawn and nothing was downloaded.
    expect(dom.created).not.toContain('canvas');
    expect(dom.anchor.href).toBe('');
  });
});
