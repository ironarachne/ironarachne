import * as AgeCategories from "$lib/age/agecategories";

test("get human variants should calculate correct age, height, and weight for human males", () => {
  let variants = AgeCategories.getHumanVariant(1, 1, 1, "male");

  let standard = AgeCategories.humanStandardMale();

  for (let i = 0; i < variants.length; i++) {
    expect(variants[i].minAge).toBe(standard[i].minAge);
    expect(variants[i].maxAge).toBe(standard[i].maxAge);
    expect(variants[i].minHeight).toBe(standard[i].minHeight);
    expect(variants[i].maxHeight).toBe(standard[i].maxHeight);
    expect(variants[i].minWeight).toBe(standard[i].minWeight);
    expect(variants[i].maxWeight).toBe(standard[i].maxWeight);
  }
});

test("get human variants should calculate correct age, height, and weight for dwarf males", () => {
  let variants = AgeCategories.getHumanVariant(3, 1, 0.5, "male");

  let standard = AgeCategories.humanStandardMale();

  for (let i = 0; i < variants.length; i++) {
    expect(variants[i].maxAge).toBe(Math.ceil(standard[i].maxAge * 3));
    expect(variants[i].minHeight).toBe(Math.ceil(standard[i].minHeight * 0.5));
    expect(variants[i].maxHeight).toBe(Math.ceil(standard[i].maxHeight * 0.5));
    expect(variants[i].minWeight).toBe(Math.ceil(standard[i].minWeight));
    expect(variants[i].maxWeight).toBe(Math.ceil(standard[i].maxWeight));
  }
});
