import { describe, expect, it } from 'vitest';
import { getSizeConfig, Sizes } from '$lib/size';
import { sentientSpeciesList } from '$lib/species_sentients';
import allSpecies from './all';

const intentionalHumanBounds = new Set([
  'changeling',
  'genasi',
  'human',
  'lizardfolk',
  'shifter',
  'tabaxi',
  'triton',
  'yuan-ti pureblood',
]);

const reviewedProducerSizes = new Set([
  'blue mussel',
  'Dungeness crab',
  'eastern oyster',
  'European flounder',
  'European perch',
  'honeybee',
  'noble crayfish',
  'wool sheep',
]);

const sentientNames = new Set(sentientSpeciesList.map(({ name }) => name));
const animalAndMonsterRoster = allSpecies.filter(
  ({ name }) => !sentientNames.has(name) && !reviewedProducerSizes.has(name),
);

function stature({ minHeight, maxHeight, minWeight, maxWeight }: ReturnType<typeof getSizeConfig>) {
  return [minHeight, maxHeight, minWeight, maxWeight];
}

describe('species size roster', () => {
  it('reserves baseline human adult measurements for intentionally human-sized species', () => {
    const baseline = ['female', 'male'].map((gender) =>
      stature(getSizeConfig(gender, 'adult', Sizes.humanStandard())),
    );
    const found = allSpecies
      .filter(({ sizeGeneratorConfigMatrix }) =>
        sizeGeneratorConfigMatrix.some(({ entries }) =>
          entries.some(({ ageCategoryName, sizeGeneratorConfig }) => {
            if (ageCategoryName !== 'adult') return false;
            const actual = stature(sizeGeneratorConfig);
            return baseline.some((bounds) =>
              bounds.every((bound, index) => bound === actual[index]),
            );
          }),
        ),
      )
      .map(({ name }) => name);
    expect(new Set(found)).toEqual(intentionalHumanBounds);
  });

  it.each(animalAndMonsterRoster)(
    '$name provides ordered size bounds for every declared age and gender',
    ({ ageCategories, genders, sizeGeneratorConfigMatrix }) => {
      expect(sizeGeneratorConfigMatrix.map(({ gender }) => gender)).toEqual(
        genders.map(({ name }) => name),
      );
      for (const { entries } of sizeGeneratorConfigMatrix) {
        expect(entries.map(({ ageCategoryName }) => ageCategoryName)).toEqual(
          ageCategories.map(({ name }) => name),
        );
        for (const { sizeGeneratorConfig: config } of entries) {
          const ranges = [
            [config.minHeight, config.maxHeight],
            [config.minLength, config.maxLength],
            [config.minMass, config.maxMass],
            [config.minWeight, config.maxWeight],
          ];
          expect(config.maxHeight + config.maxLength).toBeGreaterThan(0);
          expect([config.minWeight, config.maxWeight]).toEqual([config.minMass, config.maxMass]);
          for (const [min, max] of ranges) {
            expect(min).toBeGreaterThanOrEqual(0);
            expect(max).toBeGreaterThanOrEqual(min);
            expect(Number.isFinite(max)).toBe(true);
          }
        }
      }
    },
  );
});
