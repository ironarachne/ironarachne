import { describe, expect, it } from 'vitest';
import { buildTextPdf } from '$lib/pdf';

import { removeRegionPlace, setRegionPlaceText, setRegionText } from './region_editing';
import {
  describeRuler,
  regionMapDataUrl,
  regionDisplayName,
  regionFileStem,
  regionToDocument,
  regionToExportDocument,
  regionToMapSvg,
  regionToMarkdown,
  regionToText,
  regionSupportingFacts,
  regionFactExplanation,
} from './region_presentation';
import { emptyRegionFacts } from './region_facts';
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

  it('includes stored landmarks and hazards with hooks in both gazetteer formats', () => {
    expect(snapshot.facts.notables.length).toBeGreaterThan(0);
    for (const fact of snapshot.facts.notables) {
      expect(regionToMarkdown(snapshot)).toContain(`${fact.name}: ${fact.description}`);
      expect(regionToText(snapshot)).toContain(`${fact.name}: ${fact.description}`);
      expect(fact.description).toContain('Hook:');
    }
    const legacy = { ...snapshot, facts: { ...snapshot.facts, notables: [] } };
    expect(
      regionToDocument(legacy).sections.some((section) =>
        ['Landmarks', 'Hazards'].includes(section.heading),
      ),
    ).toBe(false);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = regionToText(snapshot);
    expect(text).toContain('REALMS');
    expect(text.startsWith(snapshot.description)).toBe(true);
    expect(text.split('\n\n')).not.toContain(snapshot.name);
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

  it('keeps the capital marker on its saved site after settlement reordering', () => {
    const stars = (svg: string) => svg.match(/<text[^>]*>★<\/text>/g);
    const reordered = { ...snapshot, settlements: [...snapshot.settlements].reverse() };
    expect(stars(regionToMapSvg(reordered))).toEqual(stars(regionToMapSvg(snapshot)));
    const removed = removeRegionPlace(snapshot, 'settlements', 0);
    expect(stars(regionToMapSvg(removed))).toBeNull();
    const legacy = { ...snapshot, facts: { ...snapshot.facts, settlementRoles: [] } };
    expect(stars(regionToMapSvg(legacy))).toEqual(stars(regionToMapSvg(snapshot)));
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

describe('stored regional facts on the illustrative map', () => {
  it('shares fact IDs and saved names with the gazetteer, including edited names', () => {
    const edited = {
      ...snapshot,
      facts: {
        ...snapshot.facts,
        habitats: snapshot.facts.habitats.map((fact, index) => ({
          ...fact,
          name: `Habitat ${index}`,
        })),
        notables: snapshot.facts.notables.map((fact, index) => ({
          ...fact,
          name: `Notable ${index}`,
        })),
      },
    };
    const svg = regionToMapSvg(edited);
    const prose = regionToMarkdown(edited);
    const facts = [...edited.facts.habitats, ...edited.facts.notables];
    const shown = facts.filter((fact) => svg.includes(`data-feature-id="${fact.id}"`));
    expect(shown.length).toBeGreaterThan(0);
    for (const fact of shown) {
      expect(svg).toContain(fact.name);
      expect(prose).toContain(fact.name);
    }
    expect(svg).toEqual(regionToMapSvg(edited));
  });
  it('keeps old maps usable without regional facts', () => {
    const legacy = { ...snapshot, facts: { ...snapshot.facts, habitats: [], notables: [] } };
    const svg = regionToMapSvg(legacy);
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('data-feature-marker');
    expect(svg).not.toContain('data-feature-kind="habitat"');
    expect(svg).toContain(`data-feature-id="${snapshot.settlements[0].id}"`);
  });
});

describe('complete gazetteer exports', () => {
  it('exports every supporting fact and explanation, including entries omitted from the short entry', () => {
    const before = structuredClone(snapshot);
    const document = regionToExportDocument(snapshot);
    const appendix = document.sections.at(-1)!;
    const facts = regionSupportingFacts(snapshot);
    expect(appendix.heading).toBe('Supporting facts and explanations');
    expect(appendix.factIds).toEqual(facts.map((fact) => fact.id));
    expect(appendix.lines).toHaveLength(facts.length);
    for (const prose of [regionToMarkdown(snapshot), regionToText(snapshot)]) {
      for (const fact of facts) {
        expect(prose).toContain(fact.description);
        for (const explanation of regionFactExplanation(snapshot, fact)) {
          expect(prose).toContain(explanation);
        }
      }
    }
    expect(snapshot).toEqual(before);
  });

  it('preserves unnamed authored facts and suppresses stale evidence in the appendix', () => {
    const edited = {
      ...snapshot,
      facts: {
        ...emptyRegionFacts('legacy'),
        habitats: [
          {
            ...snapshot.facts.habitats[0],
            name: ' ',
            description: 'A saved detail with no name.',
            origin: 'authored' as const,
            reason: {
              ruleId: 'saved-rule',
              status: 'stale' as const,
              sources: [
                {
                  kind: 'environment' as const,
                  field: 'climate' as const,
                  observedValue: 'obsolete climate',
                },
              ],
            },
          },
        ],
      },
    };
    for (const prose of [regionToMarkdown(edited), regionToText(edited)]) {
      expect(prose).toContain('Unnamed fact: A saved detail with no name.');
      expect(prose).toContain('Supporting information changed; this explanation needs review.');
      expect(prose).not.toContain('obsolete climate');
    }
  });

  it('keeps migrated legacy exports free of invented appendix content', () => {
    const legacy = { ...snapshot, facts: emptyRegionFacts('legacy') };
    expect(regionToExportDocument(legacy)).toEqual(regionToDocument(legacy));
    expect(regionToMarkdown(legacy)).not.toContain('Supporting facts and explanations');
    expect(regionToText(legacy)).not.toContain('SUPPORTING FACTS AND EXPLANATIONS');
    expect(regionToMapSvg(legacy)).toContain('<svg');
  });

  it('paginates long authored content beyond two pages without truncating the final fact', async () => {
    const edited = {
      ...snapshot,
      description: 'A whole line of saved regional history.\n'.repeat(160),
      facts: {
        ...emptyRegionFacts('legacy'),
        habitats: [
          {
            ...snapshot.facts.habitats[0],
            name: 'Final fact',
            description: 'END OF SAVED DETAIL',
            reason: undefined,
          },
        ],
      },
    };
    const blob = await buildTextPdf(edited.name, regionToText(edited));
    const pdf = new TextDecoder('latin1').decode(await blob.arrayBuffer());
    expect(Number(/\/Count (\d+)/.exec(pdf)?.[1])).toBeGreaterThan(2);
    expect(pdf).toContain('END OF SAVED DETAIL');
    expect(pdf).toContain('SUPPORTING FACTS AND EXPLANATIONS');
  });
});

describe('sourcebook gazetteer', () => {
  it('uses one document for every exported paragraph and section, without mutating the snapshot', () => {
    const before = structuredClone(snapshot);
    const document = regionToDocument(snapshot);
    const markdown = regionToMarkdown(snapshot);
    const text = regionToText(snapshot);
    for (const line of [
      ...document.paragraphs,
      ...document.sections.flatMap((section) => section.lines),
    ]) {
      expect(markdown).toContain(line);
      expect(text).toContain(line);
    }
    expect(document.sections.map((section) => section.heading)).toEqual(
      expect.arrayContaining([
        'Landscape',
        'Flora and fauna',
        'Inhabitants',
        'Livelihoods',
        'Notable places',
        'Travel',
        'Hazards',
      ]),
    );
    expect(snapshot).toEqual(before);
    expect(regionToDocument(snapshot)).toEqual(document);
  });

  it('preserves authored prose and warns beside stale assertions in every format', () => {
    const edited = {
      ...snapshot,
      description: 'A referee wrote this overview.',
      facts: {
        ...snapshot.facts,
        habitats: [
          {
            ...snapshot.facts.habitats[0],
            name: 'The copper woods',
            description: 'Leave these words alone.',
            origin: 'authored' as const,
            reason: { ruleId: 'saved-rule', status: 'stale' as const, sources: [] },
          },
        ],
      },
    };
    for (const prose of [regionToMarkdown(edited), regionToText(edited)]) {
      expect(prose).toContain('A referee wrote this overview.');
      expect(prose).toContain(
        'The copper woods: Leave these words alone. [Supporting explanation needs review.]',
      );
      expect(prose).toContain(edited.realms[0].description);
    }
  });

  it('keeps concise generated livelihoods while retaining every authored entry', () => {
    const fact = snapshot.facts.dailyLife[0];
    expect(fact).toBeDefined();
    const edited = {
      ...snapshot,
      facts: {
        ...snapshot.facts,
        dailyLife: [
          { ...fact, id: 'life:first', description: 'Representative work.' },
          { ...fact, id: 'life:second', description: 'More generated work.' },
          {
            ...fact,
            id: 'life:authored',
            origin: 'authored' as const,
            description: 'My special trade.',
          },
        ],
      },
    };
    const prose = regionToDocument(edited)
      .sections.flatMap((section) => section.lines)
      .join('\n');
    expect(prose).toContain('Representative work.');
    expect(prose).not.toContain('More generated work.');
    expect(prose).toContain('My special trade.');
    expect(
      regionSupportingFacts(edited).find((entry) => entry.id === 'life:second')?.description,
    ).toBe('More generated work.');
  });

  it('resolves settlement and route names by identity after renaming and reordering', () => {
    const renamed = {
      ...snapshot,
      settlements: snapshot.settlements
        .map((entry, index) => ({
          ...entry,
          snapshot: { ...entry.snapshot, name: `Saved town ${index}` },
        }))
        .reverse(),
    };
    const travel = regionToDocument(renamed).sections.find(
      (section) => section.heading === 'Travel',
    );
    for (const route of renamed.facts.routes) {
      for (const endpoint of route.endpoints) {
        if (endpoint.kind !== 'settlement' || endpoint.settlement.kind !== 'embedded') continue;
        const id = endpoint.settlement.settlementId;
        const name = renamed.settlements.find((entry) => entry.id === id)!.snapshot.name;
        expect(travel?.lines.some((line) => line.includes(name))).toBe(true);
      }
    }
  });

  it('omits every new section for sparse migrated content instead of inventing facts', () => {
    const legacy = { ...snapshot, facts: emptyRegionFacts('legacy') };
    expect(regionToDocument(legacy).sections.map((section) => section.heading)).toEqual(
      ['Realms', 'Settlements', 'Organizations'].filter(
        (heading) => heading !== 'Organizations' || snapshot.organizations.length > 0,
      ),
    );
    expect(regionSupportingFacts(legacy)).toEqual([]);
  });

  it('does not turn whitespace-only facts into sections or explanations', () => {
    const blank = {
      ...snapshot,
      facts: {
        ...emptyRegionFacts('legacy'),
        habitats: [{ ...snapshot.facts.habitats[0], name: ' ', description: '\n ' }],
      },
    };
    expect(
      regionToDocument(blank).sections.some((section) => section.heading === 'Landscape'),
    ).toBe(false);
  });

  it('does not manufacture a section from blank site or route prose', () => {
    const blank = {
      ...snapshot,
      facts: {
        ...emptyRegionFacts('legacy'),
        settlementRoles: [{ ...snapshot.facts.settlementRoles[0], name: ' ', description: '' }],
        routes: [{ ...snapshot.facts.routes[0], name: '', description: ' ' }],
      },
    };
    expect(
      regionToDocument(blank).sections.some((section) =>
        ['Inhabitants', 'Travel'].includes(section.heading),
      ),
    ).toBe(false);
  });

  it('offers saved sources by name, flags unavailable support and suppresses stale evidence', () => {
    const source = snapshot.facts.habitats[0];
    const fact = {
      ...source,
      reason: {
        ruleId: 'saved-rule',
        status: 'current' as const,
        sources: [
          { kind: 'fact' as const, factId: source.id },
          { kind: 'fact' as const, factId: 'missing' },
          { kind: 'environment' as const, field: 'climate' as const, observedValue: 'warm' },
          {
            kind: 'map-node' as const,
            nodeId: 1,
            property: 'moisture' as const,
            observedValue: '0.5',
          },
          {
            kind: 'map-edge' as const,
            edgeId: 2,
            property: 'road' as const,
            observedValue: 'true',
          },
        ],
      },
    };
    expect(regionFactExplanation(snapshot, fact)).toEqual([
      `${source.name}: ${source.description}`,
      'Supporting fact is unavailable.',
      'Recorded climate: warm.',
      'Recorded map site 1: moisture = 0.5.',
      'Recorded map connection 2: road = true.',
    ]);
    expect(
      regionFactExplanation(snapshot, { ...fact, reason: { ...fact.reason, status: 'stale' } }),
    ).toEqual(['Supporting information changed; this explanation needs review.']);
    expect(regionFactExplanation(snapshot, { ...source, reason: undefined })).toEqual([
      'No generated explanation is recorded.',
    ]);
  });
});
