import type { AgeCategory } from '$lib/age';
import type { Gender } from '$lib/gender';
import type { AdultBodySize, SizeRange } from './body_size_types';
import type { SizeMatrix } from './size_matrix';

const EARLY_GROWTH: AdultBodySize = {
  height: [0.35, 0.6],
  length: [0.35, 0.6],
  mass: [0.08, 0.25],
};
const LATER_GROWTH: AdultBodySize = {
  height: [0.65, 0.9],
  length: [0.65, 0.9],
  mass: [0.3, 0.75],
};

function scaleRange([min, max]: SizeRange, [minScale, maxScale]: SizeRange): SizeRange {
  return [Number((min * minScale).toPrecision(3)), Number((max * maxScale).toPrecision(3))];
}

export function bodySizeMatrix(
  ageCategories: readonly AgeCategory[],
  genders: readonly Gender[],
  adult: AdultBodySize,
): SizeMatrix {
  const adultIndex = ageCategories.findIndex(({ name }) => name === 'adult');

  return genders.map(({ name: gender }) => ({
    gender,
    entries: ageCategories.map(({ name: ageCategoryName }, index) => {
      const growth = index === 0 ? EARLY_GROWTH : LATER_GROWTH;
      const [minHeight, maxHeight] =
        index < adultIndex ? scaleRange(adult.height, growth.height) : adult.height;
      const [minLength, maxLength] =
        index < adultIndex ? scaleRange(adult.length, growth.length) : adult.length;
      const [minMass, maxMass] =
        index < adultIndex ? scaleRange(adult.mass, growth.mass) : adult.mass;

      return {
        ageCategoryName,
        sizeGeneratorConfig: {
          minHeight,
          maxHeight,
          minWeight: minMass,
          maxWeight: maxMass,
          minLength,
          maxLength,
          minMass,
          maxMass,
        },
      };
    }),
  }));
}
