import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadTextFile } from './download_text_file';

type Anchor = {
  download: string;
  href: string;
  style: { opacity: string };
  click: () => void;
  remove: () => void;
};

function stubBrowser(options: { clickThrows?: boolean; noObjectUrl?: boolean } = {}) {
  const clicked: string[] = [];
  const revoked: string[] = [];
  const anchor: Anchor = {
    download: '',
    href: '',
    style: { opacity: '' },
    click: () => {
      if (options.clickThrows === true) {
        throw new Error('this browser blocked the download');
      }
      clicked.push(anchor.download);
    },
    remove: () => {},
  };
  vi.stubGlobal('document', {
    createElement: () => anchor,
    body: { append: () => {} },
  });
  vi.stubGlobal('URL', {
    createObjectURL: () => {
      if (options.noObjectUrl === true) {
        throw new Error('blob URLs are not available');
      }
      return 'blob:the-file';
    },
    revokeObjectURL: (url: string) => void revoked.push(url),
  });
  vi.stubGlobal('Blob', class {});
  return { clicked, revoked };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('downloadTextFile', () => {
  it('hands the file to the browser and lets go of the object URL', () => {
    const browser = stubBrowser();
    expect(downloadTextFile('{}', 'ironarachne-vault-2026-08-17.json')).toBe(true);
    expect(browser.clicked).toEqual(['ironarachne-vault-2026-08-17.json']);
    expect(browser.revoked).toEqual(['blob:the-file']);
  });

  it('reports a blocked download rather than throwing, because the file is the product', () => {
    const browser = stubBrowser({ clickThrows: true });
    expect(downloadTextFile('{}', 'backup.json')).toBe(false);
    // Still let go of the URL: a refused download is not a reason to leak.
    expect(browser.revoked).toEqual(['blob:the-file']);
  });

  it('reports a browser that will not make an object URL at all', () => {
    stubBrowser({ noObjectUrl: true });
    expect(downloadTextFile('{}', 'backup.json')).toBe(false);
  });
});
