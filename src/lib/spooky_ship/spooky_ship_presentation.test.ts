import { describe, expect, it } from 'vitest';

import {
  SPOOKY_SHIP_DISPLAY_NAME,
  SPOOKY_SHIP_FILE_STEM,
  spookyShipToDocument,
  spookyShipToMarkdown,
  spookyShipToText,
} from './spooky_ship_presentation';
import { rollSpookyShip } from './spooky_ship_roll';

const SHIP = rollSpookyShip('presentation-seed');

describe('spookyShipToDocument', () => {
  it('is a heading and a paragraph', () => {
    expect(spookyShipToDocument(SHIP)).toEqual({
      title: SPOOKY_SHIP_DISPLAY_NAME,
      paragraphs: [SHIP.text],
    });
  });

  it('drops an emptied paragraph rather than carrying a blank one', () => {
    // 6.4.
    expect(spookyShipToDocument({ text: '   ' }).paragraphs).toEqual([]);
  });
});

describe('spookyShipToMarkdown', () => {
  it('writes the heading and the paragraph', () => {
    const markdown = spookyShipToMarkdown(SHIP);

    expect(markdown).toBe(`# ${SPOOKY_SHIP_DISPLAY_NAME}\n\n${SHIP.text}\n`);
  });

  it('writes the heading alone for an emptied derelict', () => {
    expect(spookyShipToMarkdown({ text: '' })).toBe(`# ${SPOOKY_SHIP_DISPLAY_NAME}\n`);
  });
});

describe('spookyShipToText', () => {
  it('writes the paragraph without the title the PDF draws itself', () => {
    expect(spookyShipToText(SHIP)).toBe(SHIP.text);
    expect(spookyShipToText(SHIP)).not.toContain(`# ${SPOOKY_SHIP_DISPLAY_NAME}`);
  });

  it('is empty for an emptied derelict rather than a blank line', () => {
    expect(spookyShipToText({ text: '' })).toBe('');
  });
});

describe('SPOOKY_SHIP_FILE_STEM', () => {
  it('names the file a download lands in', () => {
    expect(SPOOKY_SHIP_FILE_STEM).toBe('spooky-ship');
  });
});
