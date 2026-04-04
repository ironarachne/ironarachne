import type { NameGeneratorSet } from '$lib/names';
import type { Religion } from '$lib/religion';

export type Culture = {
  name: string;
  nameGenerators: NameGeneratorSet;
  organization: CulturalOrganization;
  religion: Religion;
  taboos: string[];
  greeting: string;
  eatingTrait: string;
  designTrait: string;
  musicStyle: string;
};

export type CultureGenerationConfig = {
  nameGenerators: NameGeneratorSet;
};

export type CulturalOrganization = {
  dominantGender?: string;
  powerConcentration: string;
  socialMobility: string;
  dominantProfession: string;
  description: string;
};
