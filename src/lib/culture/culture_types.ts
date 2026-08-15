import type { NameGeneratorSet } from '$lib/names';
import type { Religion } from '$lib/religion';

export type Culture = {
  name: string;
  nameGenerators: NameGeneratorSet;
  organization: CulturalOrganization;
  /**
   * The religion this culture owns, or `null` when a referenced religion artifact supplies it.
   *
   * Null rather than a copy, per rule 2 in docs/workshop.md: a reference is by identity, and a
   * culture holding its own copy of a religion someone later edits would show the stale one
   * forever. Which religion it is lives on the artifact's reference, not in the payload — so
   * reading it back is the consumer's job, and a culture that was never handed one is unaffected.
   */
  religion: Religion | null;
  taboos: string[];
  greeting: string;
  eatingTrait: string;
  designTrait: string;
  musicStyle: string;
};

/**
 * Where a generated culture's religion comes from.
 *
 * `generate` is the default and what every caller got before composition existed: the culture
 * rolls its own. `reference` says a saved religion supplies it, so the generator rolls none and
 * leaves the field null — composition is opt-in (rule 1), and this is the opting in.
 */
export type CultureReligionSource = 'generate' | 'reference';

export type CultureGenerationConfig = {
  nameGenerators: NameGeneratorSet;
  /** Defaults to `generate`. See {@link CultureReligionSource}. */
  religionSource?: CultureReligionSource;
};

export type CulturalOrganization = {
  dominantGender?: string;
  powerConcentration: string;
  socialMobility: string;
  dominantProfession: string;
  description: string;
};
