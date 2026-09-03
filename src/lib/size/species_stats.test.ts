import { describe, expect, it } from 'vitest';

import { AgeCategories } from '$lib/age';

import {
  HUMAN_BASELINE_MAX_AGE,
  MINIMUM_MAXIMUM_AGE,
  MINIMUM_PERCENT,
  SPECIES_STATS_TITLE,
  clampInput,
  clampProportions,
  speciesStatsDocument,
  speciesStatsFileStem,
  speciesStatsSummary,
  speciesStatsToMarkdown,
  speciesStatsToText,
} from './species_stats';
import type { SpeciesStatsInput } from './species_stats_types';

const HUMAN: SpeciesStatsInput = {
  maximumAge: 100,
  female: { heightPercent: 100, weightPercent: 100 },
  male: { heightPercent: 100, weightPercent: 100 },
};

/** A cleared number field binds to `null`, which the type does not describe but the DOM produces. */
const cleared = null as unknown as number;

describe('HUMAN_BASELINE_MAX_AGE', () => {
  it('is read from the age ladder rather than written as a literal', () => {
    // The component divided by a literal 100, which is right only for as long as the standard
    // human ladder happens to end at 100.
    expect(HUMAN_BASELINE_MAX_AGE).toBe(AgeCategories.getMaxAge(AgeCategories.humanStandard()));
  });
});

describe('clampProportions', () => {
  it('leaves a usable proportion alone', () => {
    expect(clampProportions({ heightPercent: 160, weightPercent: 220 })).toEqual({
      heightPercent: 160,
      weightPercent: 220,
    });
  });

  it('floors zero, negative, and cleared fields', () => {
    expect(clampProportions({ heightPercent: 0, weightPercent: -40 })).toEqual({
      heightPercent: MINIMUM_PERCENT,
      weightPercent: MINIMUM_PERCENT,
    });
    expect(clampProportions({ heightPercent: cleared, weightPercent: NaN })).toEqual({
      heightPercent: MINIMUM_PERCENT,
      weightPercent: MINIMUM_PERCENT,
    });
  });
});

describe('clampInput', () => {
  it('floors a lifespan shorter than there are age categories', () => {
    // Seven categories cannot span fewer than seven years without one ending before it begins.
    expect(clampInput({ ...HUMAN, maximumAge: 0 }).maximumAge).toBe(MINIMUM_MAXIMUM_AGE);
    expect(clampInput({ ...HUMAN, maximumAge: cleared }).maximumAge).toBe(MINIMUM_MAXIMUM_AGE);
    expect(MINIMUM_MAXIMUM_AGE).toBe(AgeCategories.humanStandard().length);
  });

  it('rounds a fractional lifespan to whole years', () => {
    expect(clampInput({ ...HUMAN, maximumAge: 87.6 }).maximumAge).toBe(88);
  });
});

describe('speciesStatsDocument', () => {
  it('reproduces the human baseline unchanged at 100% of everything', () => {
    const document = speciesStatsDocument(HUMAN);

    expect(document.title).toBe(SPECIES_STATS_TITLE);
    expect(document.lifespan).toBe(100);
    expect(document.genders.map((gender) => gender.name)).toEqual(['female', 'male']);

    const femaleAdult = document.genders[0].rows.find((row) => row.ageCategoryName === 'adult');
    expect(femaleAdult?.ageRange).toBe('20 to 60 years');
    expect(femaleAdult?.heightRange).toContain('160');

    const maleAdult = document.genders[1].rows.find((row) => row.ageCategoryName === 'adult');
    expect(maleAdult?.heightRange).toContain('175');
  });

  it('renames the teenager row, because a long-lived species has no teens', () => {
    const names = speciesStatsDocument(HUMAN).genders[0].rows.map((row) => row.ageCategoryName);

    expect(names).toContain('young adult');
    expect(names).not.toContain('teenager');
  });

  it('never returns a row that ends before it begins', () => {
    // The failure the clamps and `getVariant`'s monotonic ladder exist to prevent: an age modifier
    // small enough drove `maxAge` below the `minAge` chained from the row above, and the sheet read
    // "2 to 1 years".
    for (const maximumAge of [cleared, 0, -50, 1, 7, 8, 30, 100, 1000]) {
      const document = speciesStatsDocument({ ...HUMAN, maximumAge });
      for (const gender of document.genders) {
        let previousMax = -1;
        for (const row of gender.rows) {
          expect(row.maxAge, `${maximumAge}: ${row.ageCategoryName}`).toBeGreaterThanOrEqual(
            row.minAge,
          );
          expect(row.minAge, `${maximumAge}: ${row.ageCategoryName}`).toBeGreaterThan(previousMax);
          previousMax = row.maxAge;
        }
      }
    }
  });

  it('scales both genders by their own proportions', () => {
    const document = speciesStatsDocument({
      maximumAge: 100,
      female: { heightPercent: 50, weightPercent: 50 },
      male: { heightPercent: 200, weightPercent: 200 },
    });

    const female = document.genders[0].rows.find((row) => row.ageCategoryName === 'adult');
    const male = document.genders[1].rows.find((row) => row.ageCategoryName === 'adult');

    expect(female?.heightRange).toContain('80');
    expect(male?.heightRange).toContain('350');
  });

  it('reports the lifespan the ladder reaches rather than the one requested', () => {
    // `100 * 0.07` is `7.000000000000001`, so a seven-year lifespan rounds up to a ladder that ends
    // at eight. The sheet says eight, because that is what its last row says.
    const document = speciesStatsDocument({ ...HUMAN, maximumAge: 7 });
    const lastRow = document.genders[0].rows[document.genders[0].rows.length - 1];

    expect(document.lifespan).toBe(lastRow.maxAge);
    expect(document.ingenium.maximumLifespan).toBe(document.lifespan);
    expect(document.summary).toContain(`maximum lifespan of ${document.lifespan} years`);
  });

  it('does not age the shared human ladder by being called', () => {
    // `getVariant` used to rewrite the categories it was handed. `getHumanVariant` hands it a fresh
    // copy, but a species handing it its own list did not, so this is the guard for both.
    speciesStatsDocument({ ...HUMAN, maximumAge: 900 });

    expect(AgeCategories.humanStandard()[6].maxAge).toBe(100);
    expect(AgeCategories.humanStandard()[4].name).toBe('teenager');
  });

  it('fills the Ingenium block from the adult rows', () => {
    const document = speciesStatsDocument(HUMAN);
    const femaleAdult = document.genders[0].rows.find((row) => row.ageCategoryName === 'adult');

    expect(document.ingenium.adultAge).toBe(femaleAdult?.minAge);
    expect(document.ingenium.femaleHeight).toBe(femaleAdult?.heightRange);
    expect(document.ingenium.maleWeight).toBe(
      document.genders[1].rows.find((row) => row.ageCategoryName === 'adult')?.weightRange,
    );
  });
});

describe('speciesStatsSummary', () => {
  it('says what the numbers are proportions of', () => {
    expect(
      speciesStatsSummary(
        {
          maximumAge: 350,
          female: { heightPercent: 90, weightPercent: 85 },
          male: { heightPercent: 95, weightPercent: 92 },
        },
        350,
      ),
    ).toBe(
      'Taken against a modern human: female at 90% of human height and 85% of human weight, male at 95% of human height and 92% of human weight, with a maximum lifespan of 350 years.',
    );
  });

  it('writes one year in the singular', () => {
    expect(speciesStatsSummary(HUMAN, 1)).toContain('maximum lifespan of 1 year.');
  });
});

describe('speciesStatsToMarkdown', () => {
  it('writes a table per gender and the Ingenium block below them', () => {
    const markdown = speciesStatsToMarkdown(speciesStatsDocument(HUMAN));

    expect(markdown.startsWith(`# ${SPECIES_STATS_TITLE}\n\n`)).toBe(true);
    expect(markdown).toContain('## Female');
    expect(markdown).toContain('## Male');
    expect(markdown).toContain('| Age category | Age range | Height | Weight |');
    expect(markdown).toContain('| adult | 20 to 60 years |');
    expect(markdown).toContain('## Ingenium Second Edition heritage');
    expect(markdown).toContain('- Adult age: 20');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('never leaves a blank line inside a table', () => {
    // 6.4: a stray blank line ends a Markdown table wherever it lands.
    expect(speciesStatsToMarkdown(speciesStatsDocument(HUMAN))).not.toContain('|\n\n|');
  });
});

describe('speciesStatsToText', () => {
  it('writes the same sheet without pipes or the title the PDF draws itself', () => {
    const text = speciesStatsToText(speciesStatsDocument(HUMAN));

    expect(text).not.toContain('|');
    expect(text).not.toContain(SPECIES_STATS_TITLE);
    expect(text).toContain('Female');
    expect(text).toContain('  adult - 20 to 60 years - ');
    expect(text).toContain('Ingenium Second Edition heritage');
    expect(text.endsWith('\n')).toBe(false);
  });

  it('has no run of blank lines anywhere in it', () => {
    expect(speciesStatsToText(speciesStatsDocument(HUMAN))).not.toMatch(/\n\s*\n\s*\n/);
  });
});

describe('speciesStatsFileStem', () => {
  it('names the proportions the sheet was made from, since the species has no name yet', () => {
    expect(
      speciesStatsFileStem(
        speciesStatsDocument({
          maximumAge: 350,
          female: { heightPercent: 90, weightPercent: 85 },
          male: { heightPercent: 95, weightPercent: 92 },
        }),
      ),
    ).toBe('species-stats-f90x85-m95x92-age350');
  });

  it('names the clamped input rather than what was typed', () => {
    expect(speciesStatsFileStem(speciesStatsDocument({ ...HUMAN, maximumAge: cleared }))).toContain(
      `age${MINIMUM_MAXIMUM_AGE}`,
    );
  });
});
