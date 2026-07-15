import type AgeCategory from './age_category';

type BeastLifespanFourOptions = {
  /** Default human-like triads; used for the elderly band's weighted randomization. */
  elderlyCommonality?: 1 | 3;
  /** First band only: same ages as the default "infant" row; changes display name. */
  firstStageName?: 'infant' | 'hatchling' | 'puppy';
};

export function beastLifespanCat(): AgeCategory[] {
  return [
    {
      name: 'kitten',
      noun: 'kitten',
      minAge: 0,
      maxAge: 1,
      genderedNoun: ['kitten', 'kitten', 'kitten'],
      commonality: 2,
    },
    {
      name: 'adult',
      noun: 'adult',
      minAge: 2,
      maxAge: 10,
      genderedNoun: ['adult', 'adult', 'adult'],
      commonality: 20,
    },
    {
      name: 'elderly',
      noun: 'elder',
      minAge: 11,
      maxAge: 30,
      genderedNoun: ['elder', 'elder', 'elder'],
      commonality: 3,
    },
  ];
}

export function beastLifespanFourStage(options: BeastLifespanFourOptions = {}): AgeCategory[] {
  const elderlyCommonality = options.elderlyCommonality ?? 3;
  const first = options.firstStageName ?? 'infant';
  return [
    {
      name: first,
      noun: 'baby',
      minAge: 0,
      maxAge: 1,
      genderedNoun: ['baby', 'baby', 'baby'],
      commonality: 1,
    },
    {
      name: 'child',
      noun: 'child',
      minAge: 2,
      maxAge: 4,
      genderedNoun: ['adolescent', 'adolescent', 'adolescent'],
      commonality: 2,
    },
    {
      name: 'adult',
      noun: 'adult',
      minAge: 5,
      maxAge: 30,
      genderedNoun: ['adult', 'adult', 'adult'],
      commonality: 20,
    },
    {
      name: 'elderly',
      noun: 'elder',
      minAge: 31,
      maxAge: 45,
      genderedNoun: ['elder', 'elder', 'elder'],
      commonality: elderlyCommonality,
    },
  ];
}

export function beastLifespanHatchlingAdultFromTwo(): AgeCategory[] {
  return [
    {
      name: 'hatchling',
      noun: 'baby',
      minAge: 0,
      maxAge: 1,
      genderedNoun: ['baby', 'baby', 'baby'],
      commonality: 1,
    },
    {
      name: 'adult',
      noun: 'adult',
      minAge: 2,
      maxAge: 30,
      genderedNoun: ['adult', 'adult', 'adult'],
      commonality: 20,
    },
    {
      name: 'elderly',
      noun: 'elder',
      minAge: 31,
      maxAge: 45,
      genderedNoun: ['elder', 'elder', 'elder'],
      commonality: 3,
    },
  ];
}

export function beastLifespanHatchlingAdultFromFive(): AgeCategory[] {
  return [
    {
      name: 'hatchling',
      noun: 'baby',
      minAge: 0,
      maxAge: 1,
      genderedNoun: ['baby', 'baby', 'baby'],
      commonality: 1,
    },
    {
      name: 'adult',
      noun: 'adult',
      minAge: 5,
      maxAge: 30,
      genderedNoun: ['adult', 'adult', 'adult'],
      commonality: 20,
    },
    {
      name: 'elderly',
      noun: 'elder',
      minAge: 31,
      maxAge: 45,
      genderedNoun: ['elder', 'elder', 'elder'],
      commonality: 3,
    },
  ];
}
