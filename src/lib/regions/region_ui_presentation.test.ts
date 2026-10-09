import { describe, expect, it } from 'vitest';
import { regionToUiDocument } from './region_ui_presentation';
import { regionToMarkdown } from './region_presentation';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';

const snapshot = rollRegionSnapshot('heading-seed', {
  affiliation: 'affiliated',
  generateNeighbors: true,
});

describe('region entry headings', () => {
  it('disambiguates a section whose title matches the edited region name', () => {
    const edited = { ...snapshot, name: 'Landscape' };
    const document = regionToUiDocument(edited);
    expect(
      document.sections.some((section) => section.heading === 'Landscape (Second Section)'),
    ).toBe(true);
  });
  it.each(REGION_SEED_BANK)(
    'qualifies all $contrast entries and preserves their descriptive prose',
    ({ seed }) => {
      const saved = rollRegionSnapshot(seed);
      const before = structuredClone(saved);
      const document = regionToUiDocument(saved);
      const headings = [
        document.title,
        ...document.sections.map((section) => section.heading),
        ...document.sections.flatMap((section) =>
          section.entries.flatMap((entry) => [
            ...(entry.heading ? [entry.heading] : []),
            ...(entry.hookHeading ? [entry.hookHeading] : []),
            ...(entry.characterHeading ? [entry.characterHeading] : []),
          ]),
        ),
      ];
      expect(new Set(headings.map((heading) => heading.toLowerCase())).size).toBe(headings.length);
      for (const section of document.sections) {
        expect(section.entries.length).toBeGreaterThan(0);
        for (const entry of section.entries) {
          if (entry.factId === 'area:land' || section.heading === 'Flora and fauna')
            expect(entry.heading).toBe('');
          else if (section.heading !== 'Landscape')
            expect(entry.heading).toMatch(/^(The |A Review |An Adventure )/);
          else expect(entry.heading).not.toContain('The Landscape of');
          if (entry.body) expect(regionToMarkdown(saved)).toContain(entry.body);
          for (const paragraph of [...(entry.paragraphs ?? []), ...(entry.character ?? [])])
            expect(regionToMarkdown(saved)).toContain(paragraph);
          if (entry.hook) expect(regionToMarkdown(saved)).toContain(entry.hook);
        }
      }
      expect(saved).toEqual(before);
    },
  );

  it('keeps the regional land description as unheaded landscape prose after editing its name', () => {
    const edited = structuredClone(snapshot);
    const land = edited.facts.areas.find((fact) => fact.id === 'area:land')!;
    land.name = 'Renamed regional land';
    land.description = 'The region stretches across open uplands.';
    land.reason = { ruleId: 'saved', status: 'stale', sources: [] };
    const landscape = regionToUiDocument(edited).sections.find(
      (section) => section.heading === 'Landscape',
    )!;
    const entry = landscape.entries.find((entry) => entry.factId === land.id)!;
    expect(entry.heading).toBe('');
    expect(entry.body).toBe(land.description);
    expect(entry.warning).toBe('[Supporting explanation needs review.]');
    expect(
      landscape.entries.filter((entry) => entry.factId !== land.id).every((entry) => entry.heading),
    ).toBe(true);
    const markdown = regionToMarkdown(edited);
    expect(markdown).toContain(
      `## Landscape\n\n${land.description} [Supporting explanation needs review.]`,
    );
    expect(markdown).not.toContain(`Renamed regional land: ${land.description}`);
    land.description = ' ';
    expect(
      regionToUiDocument(edited)
        .sections.find((section) => section.heading === 'Landscape')!
        .entries.some((entry) => entry.factId === land.id),
    ).toBe(false);
  });

  it('uses the actual category and saved capital identity, including reordered settlements', () => {
    const edited = structuredClone(snapshot);
    const capital = edited.facts.settlementRoles.find((role) => role.id === 'role:capital')!;
    if (capital.settlement.kind !== 'embedded')
      throw new Error('Fixture needs an embedded capital');
    const id = capital.settlement.settlementId;
    const seat = edited.settlements.find((entry) => entry.id === id)!;
    seat.snapshot.name = 'Shadowreach';
    seat.snapshot.category.name = 'city';
    seat.snapshot.description = 'A city of towers and courtyards. Trade fills its streets.';
    edited.settlements.reverse();
    const entries = regionToUiDocument(edited).sections.find(
      (section) => section.heading === 'Settlements',
    )!.entries;
    const heading = entries.find((entry) => entry.heading === 'The Capital City of Shadowreach')!;
    expect(heading.body).toBe(seat.snapshot.description);
    expect(entries.filter((entry) => entry.heading.includes('Capital'))).toHaveLength(1);
    seat.snapshot.category.name = 'town';
    expect(
      regionToUiDocument(edited)
        .sections.find((section) => section.heading === 'Settlements')!
        .entries.some((entry) => entry.heading === 'The Capital Town of Shadowreach'),
    ).toBe(true);
  });

  it('places work, needs and character under their settlement identities after renaming and reordering', () => {
    const edited = structuredClone(snapshot);
    edited.settlements.reverse();
    edited.settlements.forEach((settlement) => {
      settlement.snapshot.name = 'Same town';
    });
    const life = edited.facts.dailyLife[0];
    const supply = edited.facts.supply[0];
    life.description = 'Saved local work.';
    life.origin = 'authored';
    life.reason = { ruleId: 'saved', status: 'stale', sources: [] };
    supply.description = 'Saved supply need.';
    supply.origin = 'authored';
    const before = structuredClone(edited);
    const document = regionToUiDocument(edited);
    expect(document.sections.map((section) => section.heading)).not.toContain('Livelihoods');
    expect(document.sections.map((section) => section.heading)).not.toContain(
      'Settlement character',
    );
    const entries = document.sections.find((section) => section.heading === 'Settlements')!.entries;
    edited.settlements.forEach((settlement, index) => {
      const entry = entries[index];
      expect(entry.body).toBe(settlement.snapshot.description.trim());
      const roles = edited.facts.settlementRoles.filter(
        (role) =>
          role.settlement.kind === 'embedded' && role.settlement.settlementId === settlement.id,
      );
      expect(entry.character).toHaveLength(roles.length);
      for (const role of roles) expect(entry.character?.join(' ')).toContain(role.description);
      if (life.settlement.kind === 'embedded' && life.settlement.settlementId === settlement.id) {
        expect(entry.paragraphs?.join(' ')).toContain(
          'Saved local work. [Supporting explanation needs review.]',
        );
      } else expect(entry.paragraphs?.join(' ')).not.toContain('Saved local work.');
      if (supply.settlement.kind === 'embedded' && supply.settlement.settlementId === settlement.id)
        expect(entry.paragraphs?.join(' ')).toContain(
          `Supply needs — ${supply.name}: Saved supply need.`,
        );
      else expect(entry.paragraphs?.join(' ')).not.toContain('Saved supply need.');
    });
    expect(edited).toEqual(before);
  });

  it('retains facts for blank, missing and referenced settlements', () => {
    const edited = structuredClone(snapshot);
    const first = edited.settlements[0];
    first.snapshot.name = ' ';
    first.snapshot.description = '';
    const role = edited.facts.settlementRoles[0];
    edited.facts.settlementRoles.push(
      {
        ...role,
        id: 'missing-role',
        settlement: { kind: 'embedded', settlementId: 'missing' },
        description: 'Missing town character.',
      },
      {
        ...role,
        id: 'referenced-role',
        settlement: { kind: 'artifact', targetId: 'reference' },
        description: 'Referenced town character.',
      },
    );
    const entries = regionToUiDocument(edited).sections.find(
      (section) => section.heading === 'Settlements',
    )!.entries;
    expect(entries[0].character?.length).toBeGreaterThan(0);
    expect(
      entries.some((entry) => entry.character?.join(' ').includes('Missing town character.')),
    ).toBe(true);
    expect(
      entries.some((entry) => entry.character?.join(' ').includes('Referenced town character.')),
    ).toBe(true);
  });

  it('does not split colons in names or prose and distinguishes duplicate entries', () => {
    const edited = structuredClone(snapshot);
    edited.facts = emptyRegionFacts('legacy');
    const original = edited.settlements[0];
    original.snapshot.name = 'Shadowreach: Old Quarter';
    original.snapshot.description =
      'An old city: its streets follow the river. A market fills the square.';
    original.snapshot.category.name = 'city';
    edited.settlements = Array.from({ length: 12 }, (_, index) => ({
      ...structuredClone(original),
      id: `settlement:${index}`,
    }));
    const entries = regionToUiDocument(edited).sections.find(
      (section) => section.heading === 'Settlements',
    )!.entries;
    expect(entries[0].heading).toBe('The Capital City of Shadowreach: Old Quarter');
    expect(new Set(entries.map((entry) => entry.heading)).size).toBe(12);
    expect(entries.every((entry) => entry.body === original.snapshot.description)).toBe(true);
  });

  it('preserves blank-name descriptions and review notices without exposing IDs', () => {
    const edited = structuredClone(snapshot);
    const habitat = edited.facts.habitats[0];
    habitat.name = ' ';
    habitat.reason!.status = 'stale';
    const document = regionToUiDocument(edited);
    const entry = document.sections
      .find((section) => section.heading === 'Landscape')!
      .entries.find((entry) => entry.factId === habitat.id)!;
    expect(entry.heading).toBe('Habitats across the region');
    expect(entry.body).toBe(habitat.description);
    expect(entry.warning).toBe('[Supporting explanation needs review.]');
    expect(
      document.sections
        .find((section) => section.heading === 'Facts needing review')!
        .entries.some((entry) => entry.heading === 'A Review of an Unnamed Fact'),
    ).toBe(true);
    expect(entry.heading).not.toContain(habitat.id);
  });

  it('gives stored adventure hooks a separate qualified subheading', () => {
    const edited = structuredClone(snapshot);
    const landmark = edited.facts.notables.find((fact) => fact.kind === 'landmark')!;
    landmark.name = 'Old Ford';
    landmark.description =
      'Travelers meet at this crossing. Hook: Escort a caravan across the river.';
    const entry = regionToUiDocument(edited)
      .sections.find((section) => section.heading === 'Notable places')!
      .entries.find((entry) => entry.factId === landmark.id)!;
    expect(entry.heading).toBe('The Landmark of Old Ford');
    expect(entry.body).toBe('Travelers meet at this crossing.');
    expect(entry.hookHeading).toBe('An Adventure Hook for The Landmark of Old Ford');
    expect(entry.hook).toBe('Escort a caravan across the river.');
  });
});
