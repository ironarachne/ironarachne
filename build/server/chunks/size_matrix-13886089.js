import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-e75cc0ec.js';
import { d as describeDice, s as simplify, r as rangeToDiceExpression } from './dice-001536f8.js';

function getCategoryFromAge(age, categories) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].minAge <= age && categories[i].maxAge >= age) {
      return categories[i];
    }
  }
  throw new Error(`Failed to find age category for age ${age}`);
}
function getHumanVariant$1(ageModifier) {
  let categories = humanStandard$1();
  return getVariant(ageModifier, categories);
}
function getMaxAge(categories) {
  let maxAge = 0;
  for (let i = 0; i < categories.length; i++) {
    if (maxAge < categories[i].maxAge) {
      maxAge = categories[i].maxAge;
    }
  }
  return maxAge;
}
function getVariant(ageModifier, categories) {
  for (let i = 0; i < categories.length; i++) {
    if (i > 0) {
      categories[i].minAge = categories[i - 1].maxAge + 1;
    }
    categories[i].maxAge = Math.ceil(categories[i].maxAge * ageModifier);
    if (categories[i].name == "teenager") {
      categories[i].name = "young adult";
      categories[i].noun = "young adult";
      categories[i].genderedNoun = ["young woman", "young man", "young adult"];
    }
  }
  return categories;
}
function humanStandard$1() {
  return [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1
    },
    {
      name: "toddler",
      noun: "toddler",
      minAge: 2,
      maxAge: 3,
      genderedNoun: ["toddler", "toddler", "toddler"],
      commonality: 1
    },
    {
      name: "young child",
      noun: "young child",
      minAge: 4,
      maxAge: 6,
      genderedNoun: ["young girl", "young boy", "young child"],
      commonality: 2
    },
    { name: "child", noun: "child", minAge: 7, maxAge: 12, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    {
      name: "teenager",
      noun: "teenager",
      minAge: 13,
      maxAge: 19,
      genderedNoun: ["teen girl", "teen boy", "teenager"],
      commonality: 8
    },
    { name: "adult", noun: "adult", minAge: 20, maxAge: 60, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 61,
      maxAge: 100,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3
    }
  ];
}
function randomWeighted(names, options) {
  let possibleAgeCategories = [];
  for (let i = 0; i < options.length; i++) {
    if (names.includes(options[i].name)) {
      possibleAgeCategories.push(options[i]);
    }
  }
  const ageCategory = RND.weighted(possibleAgeCategories);
  return ageCategory;
}
function cmToInches(cm) {
  return cm * 0.3937;
}
function kgToPounds(kg) {
  return kg * 2.2046;
}
function inchesToFeetExpression(inches) {
  let expression = "";
  const feet = Math.floor(inches / 12);
  const remainder = Math.floor(inches % 12);
  expression += feet + "'" + remainder + '"';
  return expression;
}
function getHeightRange(config) {
  const metricHeightModifier = Math.max(config.maxHeight - config.minHeight, 4);
  const metric = config.minHeight + " + " + describeDice(simplify(rangeToDiceExpression(metricHeightModifier))) + " cm";
  const imperialHeightModifier = Math.max(
    cmToInches(config.maxHeight - config.minHeight),
    4
  );
  const imperial = inchesToFeetExpression(cmToInches(config.minHeight)) + " + " + describeDice(simplify(rangeToDiceExpression(imperialHeightModifier))) + " in.";
  return `${metric} (${imperial})`;
}
function getHumanVariant(weightModifier, heightModifier) {
  const standard = humanStandard();
  let variant = [];
  for (let i = 0; i < standard.length; i++) {
    let row = { gender: standard[i].gender, entries: [] };
    for (let j = 0; j < standard[i].entries.length; j++) {
      let entry = standard[i].entries[j];
      let config = {
        minHeight: Math.round(entry.sizeGeneratorConfig.minHeight * heightModifier),
        maxHeight: Math.round(entry.sizeGeneratorConfig.maxHeight * heightModifier),
        minWeight: Math.round(entry.sizeGeneratorConfig.minWeight * weightModifier),
        maxWeight: Math.round(entry.sizeGeneratorConfig.maxWeight * weightModifier),
        minLength: entry.sizeGeneratorConfig.minLength,
        maxLength: entry.sizeGeneratorConfig.maxLength,
        minMass: entry.sizeGeneratorConfig.minMass,
        maxMass: entry.sizeGeneratorConfig.maxMass
      };
      let name = entry.ageCategoryName;
      if (entry.ageCategoryName == "teenager") {
        name = "young adult";
      }
      row.entries.push({ ageCategoryName: name, sizeGeneratorConfig: config });
    }
    variant.push(row);
  }
  return variant;
}
function getWeightRange(config) {
  const metricWeightModifier = Math.max(config.maxWeight - config.minWeight, 4);
  const metric = config.minWeight + " + " + describeDice(simplify(rangeToDiceExpression(metricWeightModifier))) + " kg";
  const imperialWeightModifier = Math.max(
    Math.round(kgToPounds(config.maxWeight - config.minWeight)),
    4
  );
  const imperial = Math.round(kgToPounds(config.minWeight)) + " + " + describeDice(simplify(rangeToDiceExpression(imperialWeightModifier))) + " lb.";
  return `${metric} (${imperial})`;
}
function humanStandard() {
  return [
    {
      gender: "female",
      entries: [
        {
          ageCategoryName: "infant",
          sizeGeneratorConfig: {
            minHeight: 49,
            maxHeight: Math.floor(49 * 1.05),
            minWeight: 2,
            maxWeight: Math.floor(2 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "toddler",
          sizeGeneratorConfig: {
            minHeight: 80,
            maxHeight: Math.floor(80 * 1.05),
            minWeight: 14,
            maxWeight: Math.floor(14 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "young child",
          sizeGeneratorConfig: {
            minHeight: 115,
            maxHeight: Math.floor(115 * 1.05),
            minWeight: 19,
            maxWeight: Math.floor(19 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "child",
          sizeGeneratorConfig: {
            minHeight: 149,
            maxHeight: Math.floor(149 * 1.05),
            minWeight: 20,
            maxWeight: Math.floor(20 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "teenager",
          sizeGeneratorConfig: {
            minHeight: 158,
            maxHeight: Math.floor(158 * 1.05),
            minWeight: 57,
            maxWeight: Math.floor(57 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "adult",
          sizeGeneratorConfig: {
            minHeight: 160,
            maxHeight: Math.floor(160 * 1.05),
            minWeight: 64,
            maxWeight: Math.floor(64 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "elderly",
          sizeGeneratorConfig: {
            minHeight: 155,
            maxHeight: Math.floor(155 * 1.05),
            minWeight: 60,
            maxWeight: Math.floor(60 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        }
      ]
    },
    {
      gender: "male",
      entries: [
        {
          ageCategoryName: "infant",
          sizeGeneratorConfig: {
            minHeight: 50,
            maxHeight: Math.floor(50 * 1.05),
            minWeight: 2,
            maxWeight: Math.floor(2 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "toddler",
          sizeGeneratorConfig: {
            minHeight: 85,
            maxHeight: Math.floor(85 * 1.05),
            minWeight: 14,
            maxWeight: Math.floor(14 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "young child",
          sizeGeneratorConfig: {
            minHeight: 115,
            maxHeight: Math.floor(115 * 1.05),
            minWeight: 20,
            maxWeight: Math.floor(20 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "child",
          sizeGeneratorConfig: {
            minHeight: 145,
            maxHeight: Math.floor(145 * 1.05),
            minWeight: 36,
            maxWeight: Math.floor(36 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "teenager",
          sizeGeneratorConfig: {
            minHeight: 170,
            maxHeight: Math.floor(170 * 1.05),
            minWeight: 68,
            maxWeight: Math.floor(68 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "adult",
          sizeGeneratorConfig: {
            minHeight: 175,
            maxHeight: Math.floor(175 * 1.05),
            minWeight: 70,
            maxWeight: Math.floor(70 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        },
        {
          ageCategoryName: "elderly",
          sizeGeneratorConfig: {
            minHeight: 170,
            maxHeight: Math.floor(170 * 1.05),
            minWeight: 65,
            maxWeight: Math.floor(65 * 1.05),
            minLength: 0,
            maxLength: 0,
            minMass: 0,
            maxMass: 0
          }
        }
      ]
    }
  ];
}
function convertMatrixToSummary(matrix, ageCategories, gender) {
  let result = [];
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].gender == gender) {
      for (let j = 0; j < matrix[i].entries.length; j++) {
        let minAge;
        let maxAge;
        for (let x = 0; x < ageCategories.length; x++) {
          if (ageCategories[x].name == matrix[i].entries[j].ageCategoryName) {
            minAge = ageCategories[x].minAge;
            maxAge = ageCategories[x].maxAge;
          }
        }
        result.push({
          genderName: gender,
          ageCategoryName: matrix[i].entries[j].ageCategoryName,
          minAge: minAge || 0,
          maxAge: maxAge || 0,
          minHeight: matrix[i].entries[j].sizeGeneratorConfig.minHeight,
          maxHeight: matrix[i].entries[j].sizeGeneratorConfig.maxHeight,
          heightRange: getHeightRange(matrix[i].entries[j].sizeGeneratorConfig),
          minWeight: matrix[i].entries[j].sizeGeneratorConfig.minWeight,
          maxWeight: matrix[i].entries[j].sizeGeneratorConfig.maxWeight,
          weightRange: getWeightRange(matrix[i].entries[j].sizeGeneratorConfig)
        });
      }
    }
  }
  return result;
}
function getSizeConfig(gender, ageCategory, sizeMatrix) {
  for (let i = 0; i < sizeMatrix.length; i++) {
    if (sizeMatrix[i].gender == gender) {
      for (let j = 0; j < sizeMatrix[i].entries.length; j++) {
        if (sizeMatrix[i].entries[j].ageCategoryName == ageCategory) {
          return sizeMatrix[i].entries[j].sizeGeneratorConfig;
        }
      }
    }
  }
  throw new Error(`Failed to find size config for ${gender} and ${ageCategory}`);
}

export { getHumanVariant as a, humanStandard as b, cmToInches as c, getSizeConfig as d, getMaxAge as e, getCategoryFromAge as f, getHumanVariant$1 as g, humanStandard$1 as h, inchesToFeetExpression as i, convertMatrixToSummary as j, kgToPounds as k, randomWeighted as r };
//# sourceMappingURL=size_matrix-13886089.js.map
