import type { Religion, ReligionGenerationConfig } from './religion_types';
import { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import {
  composePantheonDescriptionLine,
  composeReligionOverviewDescription,
} from './compose_religion_narrative';
import { generateReligionDimensions } from './comparative_dimension_generation';
import { generateReligionCosmology } from './religion_cosmology_generation';
import { generateNonTheisticReligionDetail } from './non_theistic_religion_generation';
import {
  isPolytheisticCategory,
  resolvePolytheisticStanding,
} from './resolve_polytheistic_standing';
import { generate as generateDivineRealms } from './realms/realm_generation';
import { divineRealmTypes } from './realms/realm_data';
import { generate as generatePantheon } from './pantheons/pantheon_generation';
import { domains } from './domains/domain_data';
import type { Title } from '$lib/characters';
import { all as allCategories } from './categories';
import { human as Human } from '$lib/species_sentients';
import { getFantasyNameGeneratorSet } from '$lib/names';

export const divineRulerTitle: Title = {
  femaleTitle: 'Queen of the Gods',
  maleTitle: 'King of the Gods',
  femaleHonorific: '{pronoun} Divine Majesty',
  maleHonorific: '{pronoun} Divine Majesty',
  hasLands: false,
  isHereditary: false,
  isNoble: false,
  isRoyal: true,
  landName: '',
  precedence: 0,
  tags: ['divine ruler'],
};

export function generateReligion(seed: string, config: ReligionGenerationConfig): Religion {
  const rng = new RNG(seed);

  const realmGenerationConfig = {
    minNumberOfRealms: 1,
    maxNumberOfRealms: 3,
    possibleTypes: divineRealmTypes,
    hasAfterlife: true,
    hasDivineAbode: true,
    hasElementalPlanes: false,
  };
  const realms = generateDivineRealms(`${seed}-realms`, realmGenerationConfig);

  const category = rng.item(config.categories);

  const religionName = config.nameGenerator.generate(1)[0];

  const dimensions = generateReligionDimensions(`${seed}-dimensions`, {
    category,
    dimensionGeneration: config.dimensionGeneration,
  });

  if (category.hasDeities) {
    const pantheonConfig = {
      realms,
      domains,
      speciesOptions: config.deitySpeciesOptions,
      minDeities: category.minDeities,
      maxDeities: category.maxDeities,
      maleNameGenerator: config.maleNameGenerator,
      femaleNameGenerator: config.femaleNameGenerator,
    };
    const pantheon = generatePantheon(`${seed}-pantheon`, pantheonConfig);

    const polytheisticStanding = resolvePolytheisticStanding(
      config.polytheisticStanding,
      category,
      rng,
    );
    const skipLeaderForEgalitarianPolytheism =
      polytheisticStanding === 'egalitarian' && isPolytheisticCategory(category);

    let leaderName: string | null = null;
    if (!skipLeaderForEgalitarianPolytheism && category.hasLeader && pantheon.members.length > 0) {
      pantheon.leader = rng.int(0, pantheon.members.length - 1);
      const leaderDeity = pantheon.members[pantheon.leader];
      leaderDeity.titles?.push(divineRulerTitle);
      leaderName = leaderDeity.name;
    } else {
      pantheon.leader = -1;
    }

    const soleDeityName =
      pantheon.members.length === 1 ? (pantheon.members[0]?.name ?? null) : null;
    const pantheonLine = composePantheonDescriptionLine(
      category,
      pantheon.members.length,
      leaderName,
      soleDeityName,
      polytheisticStanding,
    );
    pantheon.description = pantheonLine;

    const cosmology = generateReligionCosmology(
      `${seed}-cosmology`,
      config.spiritCosmologyDepth,
      rng,
    );
    const description = composeReligionOverviewDescription(
      `${seed}-desc`,
      category,
      dimensions,
      cosmology?.summary ?? null,
      null,
      polytheisticStanding,
    );

    return {
      name: religionName,
      description,
      dimensions,
      cosmology: cosmology ?? undefined,
      realms,
      pantheon,
    };
  }

  const nonTheisticDetail = generateNonTheisticReligionDetail(`${seed}-nontheist`, category);
  const description = composeReligionOverviewDescription(
    `${seed}-desc`,
    category,
    dimensions,
    null,
    nonTheisticDetail.narrativeSummary,
    null,
  );

  return {
    name: religionName,
    description,
    dimensions,
    nonTheisticDetail,
    realms,
    pantheon: null,
  };
}

export function getDefaultReligionGenerationConfig(): ReligionGenerationConfig {
  const nameGeneratorSet = getFantasyNameGeneratorSet('tiefling', new RNG(Date.now()));

  return {
    categories: allCategories(),
    deitySpeciesOptions: [Human],
    nameGenerator: nameGeneratorSet.family,
    femaleNameGenerator: nameGeneratorSet.female,
    maleNameGenerator: nameGeneratorSet.male,
  };
}

export function randomGatheringPlace(seed: string): string {
  const rng = new RNG(seed);

  let description = rng.item([
    '{follower} gather in {place} for {service}',
    '{follower} congregate in {place} to be led in {service} by {leader}',
    '{follower} meet in {place} to engage in {service} and hear from {leader}',
    'At {place}, {follower} come together for {service} led by {leader}',
    'Join {follower} at {place} for {service} and fellowship with {leader}',
    '{follower} assemble in {place} to participate in {service} and share with {leader}',
    '{follower} unite at {place} for {service} and to learn from {leader}',
    'At {place}, {follower} come together to seek guidance and wisdom from {leader} through {service}',
  ]);

  const follower = rng.item([
    'adherents',
    'believers',
    'disciples',
    'devotees',
    'faithful',
    'followers',
    'pilgrims',
    'worshippers',
    'zealots',
  ]);

  const place = rng.item([
    'temples',
    'churches',
    'mosques',
    'synagogues',
    'chapels',
    'shrines',
    'sanctuaries',
    'meeting halls',
    'community centers',
    'outdoor arenas',
  ]);

  const service = rng.item([
    'silent meditation',
    'guided meditation',
    'chanting',
    'prayer',
    'sacrament',
    'communion',
    'worship',
    'ritual dance',
    'ritual music',
    'structured recitation',
    'spontaneous sharing',
    'teachings and discussions',
    'ritual sacrifice',
  ]);

  const leader = rng.item([
    'priest',
    'priestess',
    'minister',
    'shaman',
    'spiritual guide',
    'community leader',
    'wise elder',
    'prophet',
    'guru',
    'ascended master',
    'enlightened one',
    'mystic',
    'oracle',
  ]);

  description = description
    .replace('{follower}', follower)
    .replace('{place}', place)
    .replace('{service}', service)
    .replace('{leader}', Words.article(leader) + ' ' + leader);

  return description;
}

export function randomGatheringTimes(seed: string): string {
  const rng = new RNG(seed);

  let description = rng.item([
    'Regular gatherings happen once a week.',
    'Regular gatherings happen daily.',
    'Regular gatherings happen once a month.',
    'Weekly gatherings take place every {weekday}.',
    'They come together every {weekday} for a time of {service}.',
    'Their community meets {frequency} for {service} at {time}.',
    'Their gatherings occur {frequency}, bringing {follower} together for {service}.',
    'They gather {frequency} at {place} for {service} and {activity}.',
    'Every {weekday} they gather for {service}, followed by {activity}.',
    'Their gatherings happen {frequency} at {place} and feature {service}, {activity}, and food/drink.',
    'People are invited to the {occasion} gathering, where they partake in {service} and {activity}.',
  ]);

  description = description
    .replace(
      '{weekday}',
      rng.item(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    )
    .replace('{frequency}', rng.item(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually']))
    .replace(
      '{follower}',
      rng.item(['worshipers', 'devotees', 'believers', 'faithful', 'followers', 'pilgrims']),
    )
    .replace(
      '{service}',
      rng.item(['prayer', 'worship', 'meditation', 'reflection', 'ritual', 'sermon', 'teaching']),
    )
    .replace('{time}', rng.item(['sunrise', 'midday', 'sunset', 'evening', 'night']))
    .replace(
      '{place}',
      rng.item([
        'the temple',
        'the church',
        'the mosque',
        'the synagogue',
        'the chapel',
        'the shrine',
        'the sanctuary',
        'the meeting hall',
      ]),
    )
    .replace(
      '{activity}',
      rng.item([
        'fellowship',
        'conversation',
        'sharing',
        'food and drink',
        'community service',
        'study',
      ]),
    )
    .replace('{occasion}', rng.item(['special', 'holiday', 'festive', 'solemn']));

  return description;
}
