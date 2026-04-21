import { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Data from './non_theistic_religion_data';
import type { NonTheisticTagged } from './non_theistic_religion_data';
import type { NonTheisticReligionDetail } from './non_theistic_religion_types';
import type { ReligionCategory } from './religion_types';

function pickUniqueTagged<T extends NonTheisticTagged>(rng: RNG, pool: readonly T[], count: number): T[] {
  if (pool.length === 0 || count <= 0) {
    return [];
  }
  const n = Math.min(count, pool.length);
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = rng.int(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function buildPollutionRepairProse(pollutionPhrase: string, repairPhrase: string): string {
  return Words.buildSentence([Words.arrayToPhrase([pollutionPhrase, repairPhrase])]);
}

function buildPollutionRepairNotes(pollutionPhrase: string, repairPhrase: string): string {
  return Words.fixPunctuation(buildPollutionRepairProse(pollutionPhrase, repairPhrase));
}

function buildAnimism(rng: RNG): NonTheisticReligionDetail {
  const domainRows = pickUniqueTagged(rng, Data.animismDomainPool, rng.int(3, 5));
  const obligationRows = pickUniqueTagged(rng, Data.animismObligationPool, rng.int(2, 3));
  const spiritDomains = domainRows.map((r) => r.id);
  const obligationCycles = obligationRows.map((r) => r.id);
  const mediationRoles = ['elders who read weather in the body', 'travelers who carry small exchange gifts'];
  const pollutionRow = rng.item(Data.pollutionPool);
  const repairRow = rng.item(Data.purityRepairPool);
  const domainPhrase = Words.arrayToPhrase(domainRows.map((r) => r.phrase));
  const obligationPhrase = Words.arrayToPhrase(obligationRows.map((r) => r.phrase));
  const mediationSummary = Words.buildSentence([
    'households rarely speak of worship so much as courtesy, and',
    Words.arrayToPhrase(mediationRoles),
    'help interpret when a place has been slighted',
  ]);
  const narrativeSummary = Words.fixPunctuation(
    `${Words.buildSentence([
      'the unseen is scattered rather than enthroned: agency pools in',
      domainPhrase,
      ', and neglect is read as rudeness more often than as sin',
    ])} ${Words.buildSentence([
      'the year turns on',
      obligationPhrase,
      ', small rounds that stitch travel, harvest, and grief to specific sites',
    ])} ${mediationSummary} ${buildPollutionRepairProse(pollutionRow.phrase, repairRow.phrase)}`,
  );
  return {
    categoryName: 'animism',
    spiritDomains,
    obligationCycles,
    mediationRoles,
    mediationSummary,
    pollutionOrPurityNotes: buildPollutionRepairNotes(pollutionRow.phrase, repairRow.phrase),
    narrativeSummary,
  };
}

function buildTotemism(rng: RNG): NonTheisticReligionDetail {
  const emblemRows = pickUniqueTagged(rng, Data.totemEmblemPool, rng.int(2, 3));
  const obligationRows = pickUniqueTagged(rng, Data.totemObligationPool, rng.int(2, 4));
  const spiritDomains = emblemRows.map((r) => `emblem_${r.id}`);
  const obligationCycles = obligationRows.map((r) => r.id);
  const mediationRoles = ['clan memory-keepers', 'initiators who guard emblem regalia'];
  const pollutionRow = rng.item(Data.pollutionPool);
  const repairRow = rng.item(Data.purityRepairPool);
  const emblemPhrase = Words.arrayToPhrase(emblemRows.map((r) => r.phrase));
  const obligationPhrase = Words.arrayToPhrase(obligationRows.map((r) => r.phrase));
  const mediationSummary = Words.buildSentence([
    Words.arrayToPhrase(mediationRoles),
    'translate emblem law into marriage, feud, and feast without elevating a single sky tyrant',
  ]);
  const narrativeSummary = Words.fixPunctuation(
    `${Words.buildSentence([
      'identity clings to',
      emblemPhrase,
      'as living charters: kin trace descent through stories of the emblem rather than through a pantheon',
    ])} ${Words.buildSentence([
      'obligation clusters around',
      obligationPhrase,
      ', because the emblem is not a pet but a treaty written into bodies and land',
    ])} ${mediationSummary} ${buildPollutionRepairProse(pollutionRow.phrase, repairRow.phrase)}`,
  );
  return {
    categoryName: 'totemism',
    spiritDomains,
    obligationCycles,
    mediationRoles,
    mediationSummary,
    pollutionOrPurityNotes: buildPollutionRepairNotes(pollutionRow.phrase, repairRow.phrase),
    narrativeSummary,
  };
}

function buildAncestorWorship(rng: RNG): NonTheisticReligionDetail {
  const shrineRows = pickUniqueTagged(rng, Data.ancestorShrinePool, rng.int(2, 3));
  const obligationRows = pickUniqueTagged(rng, Data.ancestorObligationPool, rng.int(2, 4));
  const spiritDomains = shrineRows.map((r) => `ancestor_${r.id}`);
  const obligationCycles = obligationRows.map((r) => r.id);
  const mediationRoles = ['senior kin who tend the tablets', 'widows who relay dreams from the niche'];
  const pollutionRow = rng.item(Data.pollutionPool);
  const repairRow = rng.item(Data.purityRepairPool);
  const shrinePhrase = Words.arrayToPhrase(shrineRows.map((r) => r.phrase));
  const obligationPhrase = Words.arrayToPhrase(obligationRows.map((r) => r.phrase));
  const mediationSummary = Words.buildSentence([
    Words.arrayToPhrase(mediationRoles),
    'decide when the dead are insulted, when they are ready to bless a venture, and when silence means a warning',
  ]);
  const narrativeSummary = Words.fixPunctuation(
    `${Words.buildSentence([
      'the dead stay near as counsel and constraint, anchored at',
      shrinePhrase,
      'rather than in distant heavens',
    ])} ${Words.buildSentence([
      'households rehearse',
      obligationPhrase,
      ', because forgetting feeds restless dead more surely than heresy',
    ])} ${mediationSummary} ${buildPollutionRepairProse(pollutionRow.phrase, repairRow.phrase)}`,
  );
  return {
    categoryName: 'ancestor worship',
    spiritDomains,
    obligationCycles,
    mediationRoles,
    mediationSummary,
    pollutionOrPurityNotes: buildPollutionRepairNotes(pollutionRow.phrase, repairRow.phrase),
    narrativeSummary,
  };
}

function buildShamanism(rng: RNG): NonTheisticReligionDetail {
  const journeyRows = pickUniqueTagged(rng, Data.shamanJourneyPool, rng.int(2, 3));
  const roleRows = pickUniqueTagged(rng, Data.shamanRolePool, rng.int(2, 3));
  const paymentRows = pickUniqueTagged(rng, Data.shamanPaymentPool, rng.int(1, 2));
  const spiritDomains = journeyRows.map((r) => `journey_${r.id}`);
  const obligationCycles = paymentRows.map((r) => `exchange_${r.id}`);
  const mediationRoles = roleRows.map((r) => r.phrase);
  const pollutionRow = rng.item(Data.pollutionPool);
  const repairRow = rng.item(Data.purityRepairPool);
  const journeyPhrase = Words.arrayToPhrase(journeyRows.map((r) => r.phrase));
  const paymentPhrase = Words.arrayToPhrase(paymentRows.map((r) => r.phrase));
  const mediationSummary = Words.buildSentence([
    Words.arrayToPhrase(mediationRoles),
    'specialize in',
    journeyPhrase,
    ', and their work is paid in',
    paymentPhrase,
    'so the exchange stays honest on both sides of the veil',
  ]);
  const narrativeSummary = Words.fixPunctuation(
    `${Words.buildSentence([
      'the spirit world is reached by skilled travel rather than by fixed temples, through',
      journeyPhrase,
    ])} ${mediationSummary} ${buildPollutionRepairProse(pollutionRow.phrase, repairRow.phrase)}`,
  );
  return {
    categoryName: 'shamanism',
    spiritDomains,
    obligationCycles,
    mediationRoles,
    mediationSummary,
    pollutionOrPurityNotes: buildPollutionRepairNotes(pollutionRow.phrase, repairRow.phrase),
    narrativeSummary,
  };
}

const genericDomainPool: NonTheisticTagged[] = [
  { id: 'local_customary_unseen', phrase: 'local customary powers of the unseen' },
  { id: 'place_memory', phrase: 'place-memory that clings to old sites' },
  { id: 'kin_obligation', phrase: 'kin obligation that outranks private whim' },
];

const genericObligationPool: NonTheisticTagged[] = [
  { id: 'seasonal_assembly', phrase: 'seasonal assemblies at marked turns of the year' },
  { id: 'life_passage_rites', phrase: 'life-passage rites that must be witnessed' },
];

function buildGenericNonTheistic(categoryName: string, rng: RNG): NonTheisticReligionDetail {
  const domainRows = pickUniqueTagged(rng, genericDomainPool, genericDomainPool.length);
  const obligationRows = pickUniqueTagged(rng, genericObligationPool, genericObligationPool.length);
  const spiritDomains = domainRows.map((r) => r.id);
  const obligationCycles = obligationRows.map((r) => r.id);
  const mediationRoles = [
    'recognized intermediaries who carry public trust',
    'elders whose dreams carry weight in disputes',
  ];
  const pollutionRow = rng.item(Data.pollutionPool);
  const repairRow = rng.item(Data.purityRepairPool);
  const mediationSummary = Words.buildSentence([
    Words.arrayToPhrase(mediationRoles),
    'interpret signs and settle disputes when the unseen presses on daily life',
  ]);
  const narrativeSummary = Words.fixPunctuation(
    `${Words.buildSentence([
      'this tradition keeps the sacred close to habit and landscape without naming a ruling pantheon',
    ])} ${Words.buildSentence([
      'people speak of',
      Words.arrayToPhrase(domainRows.map((r) => r.phrase)),
      'and return to',
      Words.arrayToPhrase(obligationRows.map((r) => r.phrase)),
    ])} ${mediationSummary} ${buildPollutionRepairProse(pollutionRow.phrase, repairRow.phrase)}`,
  );
  return {
    categoryName,
    spiritDomains,
    obligationCycles,
    mediationRoles,
    mediationSummary,
    pollutionOrPurityNotes: buildPollutionRepairNotes(pollutionRow.phrase, repairRow.phrase),
    narrativeSummary,
  };
}

export function generateNonTheisticReligionDetail(
  seed: string,
  category: ReligionCategory,
): NonTheisticReligionDetail {
  if (category.hasDeities) {
    throw new Error('generateNonTheisticReligionDetail requires a non-theistic category.');
  }
  const stream = new RNG(`${seed}-nontheistic`);
  switch (category.name) {
    case 'animism':
      return buildAnimism(stream);
    case 'totemism':
      return buildTotemism(stream);
    case 'ancestor worship':
      return buildAncestorWorship(stream);
    case 'shamanism':
      return buildShamanism(stream);
    default:
      return buildGenericNonTheistic(category.name, stream);
  }
}
