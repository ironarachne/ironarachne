import { expect, describe, it, vi, afterEach } from 'vitest';
import downloadInBrowser from './index';

type FakeAnchor = {
  download: string;
  href: string;
  style: { opacity: string };
  click: () => void;
  remove: () => void;
};

type AnchorState = {
  download: string;
  href: string;
  opacity: string;
  appended: boolean;
};

/**
 * Stubs the minimum of `document` that downloadInBrowser touches. The project has no DOM
 * environment configured for Vitest, so the anchor is faked rather than pulling in jsdom.
 */
function stubDocument() {
  const created: string[] = [];
  const events: string[] = [];
  let stateAtClick: AnchorState | undefined;
  let appended = false;

  const anchor: FakeAnchor = {
    download: '',
    href: '',
    style: { opacity: '' },
    click: () => {
      events.push('click');
      stateAtClick = {
        download: anchor.download,
        href: anchor.href,
        opacity: anchor.style.opacity,
        appended,
      };
    },
    remove: () => {
      events.push('remove');
      appended = false;
    },
  };

  const document = {
    createElement: (tag: string) => {
      created.push(tag);
      return anchor;
    },
    body: {
      append: (element: FakeAnchor) => {
        events.push('append');
        appended = element === anchor;
      },
    },
  };

  vi.stubGlobal('document', document as unknown as Document);

  return {
    anchor,
    created,
    events,
    isAppended: () => appended,
    stateAtClick: () => stateAtClick,
  };
}

describe('downloadInBrowser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an anchor element', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.created).toEqual(['a']);
  });

  it('sets the download filename and href', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.anchor.download).toBe('map.svg');
    expect(dom.anchor.href).toBe('blob:abc');
  });

  it('hides the anchor so it never shows in the page', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.anchor.style.opacity).toBe('0');
  });

  it('appends, clicks, then removes the anchor in that order', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.events).toEqual(['append', 'click', 'remove']);
  });

  it('has the href and filename in place before clicking', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.stateAtClick()).toEqual({
      download: 'map.svg',
      href: 'blob:abc',
      opacity: '0',
      appended: true,
    });
  });

  it('leaves no anchor behind in the document', () => {
    const dom = stubDocument();
    downloadInBrowser('blob:abc', 'map.svg');

    expect(dom.isAppended()).toBe(false);
  });

  it('passes data URIs through unchanged', () => {
    const dom = stubDocument();
    const href = 'data:text/plain;charset=utf-8,hello%20world';
    downloadInBrowser(href, 'notes.txt');

    expect(dom.anchor.href).toBe(href);
    expect(dom.anchor.download).toBe('notes.txt');
  });
});
