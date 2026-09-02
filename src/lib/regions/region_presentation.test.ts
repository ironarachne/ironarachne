import { describe, expect, it } from 'vitest';

import { removeRegionPlace, setRegionPlaceText, setRegionText } from './region_editing';
import {
  describeRuler,
  regionMapDataUrl,
  regionDisplayName,
  regionFileStem,
  regionToDocument,
  regionToMapSvg,
  regionToMarkdown,
  regionToText,
} from './region_presentation';
import { rollRegionSnapshot } from './region_roll';
import { toRegionSnapshot } from './region_snapshot';
import { rollRegion } from './region_roll';

const snapshot = rollRegionSnapshot('presentation-seed');

describe('arranging a region for reading', () => {
  const document = regionToDocument(snapshot);

  it('is headed by the region and says who rules it', () => {
    expect(document.title).toEqual(snapshot.name);
    expect(document.paragraphs.at(-1)).toContain(snapshot.authority.firstName);
  });

  it('lists the realms with who holds each', () => {
    const realms = document.sections.find((section) => section.heading === 'Realms');
    expect(realms?.lines).toHaveLength(snapshot.realms.length);
    expect(realms?.lines.some((line) => line.includes('the seat of this region'))).toBe(true);
  });

  it('lists the settlements', () => {
    const settlements = document.sections.find((section) => section.heading === 'Settlements');
    expect(settlements?.lines.length).toEqual(snapshot.settlements.length);
  });
});

describe('dropping what is empty (6.4)', () => {
  it('prints no culture line for a region whose culture was referenced', () => {
    const referenced = toRegionSnapshot(rollRegion('presentation-seed').region, {
      cultureIsReferenced: true,
    });
    expect(
      regionToDocument(referenced).paragraphs.some((line) => line.includes('dominant culture')),
    ).toBe(false);
  });

  it('prints no Settlements section once the last settlement is removed', () => {
    let stripped = snapshot;
    for (let index = snapshot.settlements.length - 1; index >= 0; index--) {
      stripped = removeRegionPlace(stripped, 'settlements', index);
    }
    expect(
      regionToDocument(stripped).sections.some((section) => section.heading === 'Settlements'),
    ).toBe(false);
  });

  it('prints no blank paragraph for a description that has been emptied', () => {
    const blanked = setRegionText(snapshot, 'description', '  ');
    expect(regionToDocument(blanked).paragraphs.every((line) => line.trim() !== '')).toBe(true);
  });

  it('drops a settlement whose name and description are both empty', () => {
    const emptied = setRegionPlaceText(
      setRegionPlaceText(snapshot, 'settlements', 0, 'name', ''),
      'settlements',
      0,
      'description',
      '',
    );
    const settlements = regionToDocument(emptied).sections.find(
      (section) => section.heading === 'Settlements',
    );
    expect(settlements?.lines.length).toEqual(snapshot.settlements.length - 1);
  });

  it('names a realm that has been left nameless', () => {
    const nameless = { ...snapshot, realms: [{ ...snapshot.realms[0], name: '' }] };
    const realms = regionToDocument(nameless).sections.find(
      (section) => section.heading === 'Realms',
    );
    expect(realms?.lines[0]).toContain('Realm 1');
  });
});

describe('describing a ruler', () => {
  it('gives an honorific, a name and a species', () => {
    const line = describeRuler(snapshot.authority);
    expect(line).toContain(snapshot.authority.firstName);
    expect(line).toContain(snapshot.authority.speciesName);
  });
});

describe('exporting a region (6.3)', () => {
  it('writes a Markdown gazetteer', () => {
    const markdown = regionToMarkdown(snapshot);
    expect(markdown).toContain(`# ${snapshot.name}`);
    expect(markdown).toContain('## Realms');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = regionToText(snapshot);
    expect(text).toContain('REALMS');
    expect(text.startsWith(snapshot.name)).toBe(false);
  });

  it('never leaves a blank line where a part had nothing to say', () => {
    const bare = setRegionText(snapshot, 'description', '');
    expect(regionToMarkdown(bare)).not.toContain('\n\n\n');
    expect(regionToText(bare)).not.toContain('\n\n\n');
  });

  it('draws the map, which is what a region is', () => {
    const svg = regionToMapSvg(snapshot);
    // A standalone document, XML declaration and all, because it is a file someone saves.
    expect(svg.startsWith('<?xml')).toBe(true);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).not.toContain('NaN');
  });

  it('offers the map as a data URL for the page to show', () => {
    // An image rather than inline markup: the map's paths extend past the viewBox that clips them,
    // and the mobile overflow sweep measures every element's real bounding box.
    const url = regionMapDataUrl(snapshot);
    expect(url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(url.split(',')[1])).toContain('</svg>');
  });

  it('labels the map with the region and its towns', () => {
    const svg = regionToMapSvg(snapshot);
    expect(svg).toContain(snapshot.name);
  });

  it('carries an edit straight into the exports', () => {
    const edited = setRegionText(snapshot, 'name', 'The Cold Marches');
    expect(regionToMarkdown(edited)).toContain('# The Cold Marches');
    expect(regionToMapSvg(edited)).toContain('The Cold Marches');
  });
});

describe('naming a region for a file', () => {
  it('uses the region name', () => {
    expect(regionDisplayName(snapshot)).toEqual(snapshot.name);
    expect(regionFileStem({ name: 'The Cold Marches' })).toEqual('region-the-cold-marches');
  });

  it('falls back to the bare stem for a region with no name', () => {
    expect(regionDisplayName({ name: '  ' })).toEqual('Region');
    expect(regionFileStem({ name: '' })).toEqual('region');
  });
});
