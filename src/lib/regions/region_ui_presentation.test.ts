import { describe, expect, it } from 'vitest';
import { regionToUiDocument } from './region_ui_presentation';
import { regionToMarkdown } from './region_presentation';
import { rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { REGION_SEED_BANK } from '../../../test_fixtures/region_seeds';

const snapshot = rollRegionSnapshot('heading-seed');

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
            entry.heading,
            ...(entry.hookHeading ? [entry.hookHeading] : []),
          ]),
        ),
      ];
      expect(new Set(headings.map((heading) => heading.toLowerCase())).size).toBe(headings.length);
      for (const section of document.sections) {
        expect(section.entries.length).toBeGreaterThan(0);
        for (const entry of section.entries) {
          expect(entry.heading).toMatch(/^(The |A Review |An Adventure )/);
          if (entry.body) expect(regionToMarkdown(saved)).toContain(entry.body);
          if (entry.hook) expect(regionToMarkdown(saved)).toContain(entry.hook);
        }
      }
      expect(saved).toEqual(before);
    },
  );

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
    expect(entry.heading).toBe('The Landscape of an Unnamed Feature');
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
