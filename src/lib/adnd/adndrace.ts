export default class ADNDRace {
  name: string;
  adjective: string;
  apply: Function;
  minStrength: number;
  maxStrength: number;
  minDexterity: number;
  maxDexterity: number;
  minConstitution: number;
  maxConstitution: number;
  minIntelligence: number;
  maxIntelligence: number;
  minWisdom: number;
  maxWisdom: number;
  minCharisma: number;
  maxCharisma: number;
  baseHeightMale: number;
  baseHeightFemale: number;
  baseWeightMale: number;
  baseWeightFemale: number;
  heightModifier: string; // dice expression
  weightModifier: string; // dice expression
  baseAge: number;
  baseMovement: number;
  ageModifier: string; // dice expression
  availableInitialLanguages: string[];
  allowedClasses: string[];

  constructor(
    name: string,
    adjective: string,
    apply: Function,
    minStrength: number,
    maxStrength: number,
    minDexterity: number,
    maxDexterity: number,
    minConstitution: number,
    maxConstitution: number,
    minIntelligence: number,
    maxIntelligence: number,
    minWisdom: number,
    maxWisdom: number,
    minCharisma: number,
    maxCharisma: number,
    baseHeightMale: number,
    baseHeightFemale: number,
    baseWeightMale: number,
    baseWeightFemale: number,
    heightModifier: string,
    weightModifier: string,
    baseAge: number,
    baseMovement: number,
    ageModifier: string,
    availableInitialLanguages: string[],
    allowedClasses: string[],
  ) {
    this.name = name;
    this.adjective = adjective;
    this.apply = apply;
    this.minCharisma = minCharisma;
    this.maxCharisma = maxCharisma;
    this.minConstitution = minConstitution;
    this.maxConstitution = maxConstitution;
    this.minDexterity = minDexterity;
    this.maxDexterity = maxDexterity;
    this.minIntelligence = minIntelligence;
    this.maxIntelligence = maxIntelligence;
    this.minStrength = minStrength;
    this.maxStrength = maxStrength;
    this.minWisdom = minWisdom;
    this.maxWisdom = maxWisdom;
    this.heightModifier = heightModifier;
    this.baseHeightMale = baseHeightMale;
    this.baseHeightFemale = baseHeightFemale;
    this.baseWeightMale = baseWeightMale;
    this.baseWeightFemale = baseWeightFemale;
    this.heightModifier = heightModifier;
    this.weightModifier = weightModifier;
    this.baseAge = baseAge;
    this.baseMovement = baseMovement;
    this.ageModifier = ageModifier;
    this.name = name;
    this.availableInitialLanguages = availableInitialLanguages;
    this.allowedClasses = allowedClasses;
  }
}
