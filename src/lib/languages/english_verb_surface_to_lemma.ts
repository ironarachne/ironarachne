/**
 * Maps common English verb surfaces (finite auxiliaries, irregular past/participles)
 * to present-tense lemmas used in the lexicon and parser.
 */

/** Past / participle / finite aux surfaces where the lemma differs from the surface, plus copula chain. */
export const ENGLISH_VERB_IRREGULAR_PAST_TO_PRESENT: Readonly<Record<string, string>> = {
  was: 'be',
  were: 'be',
  been: 'be',
  had: 'have',
  went: 'go',
  saw: 'see',
  ate: 'eat',
  came: 'come',
  ran: 'run',
  fell: 'fall',
  broke: 'break',
  drank: 'drink',
  swam: 'swim',
  fought: 'fight',
  flew: 'fly',
  bit: 'bite',
  found: 'find',
  knew: 'know',
  sat: 'sit',
  slept: 'sleep',
  stood: 'stand',
  struck: 'strike',
  threw: 'throw',
  hid: 'hide',
  held: 'hold',
  said: 'say',
  left: 'leave',
  got: 'get',
  began: 'begin',
  told: 'tell',
  heard: 'hear',
  gave: 'give',
  brought: 'bring',
  felt: 'feel',
  kept: 'keep',
  lost: 'lose',
  sent: 'send',
  caught: 'catch',
  bought: 'buy',
  meant: 'mean',
  wrote: 'write',
  done: 'do',
  gone: 'go',
  did: 'do',
  took: 'take',
  thought: 'think',
  grew: 'grow',
  led: 'lead',
  rose: 'rise',
};

const PRESENT_AUX: Readonly<Record<string, string>> = {
  is: 'be',
  am: 'be',
  are: 'be',
  be: 'be',
  has: 'have',
  have: 'have',
  does: 'do',
  do: 'do',
};

export const ENGLISH_VERB_SURFACE_TO_PRESENT_LEMMA: Readonly<Record<string, string>> = {
  ...PRESENT_AUX,
  ...ENGLISH_VERB_IRREGULAR_PAST_TO_PRESENT,
};

const FINITE_AUX_NO_NOUN: ReadonlySet<string> = new Set([
  'is',
  'am',
  'are',
  'was',
  'were',
  'does',
  'did',
  'has',
  'been',
  'be',
  'done',
  'do',
]);

export function englishVerbSurfaceToPresentLemma(surface: string): string | null {
  return ENGLISH_VERB_SURFACE_TO_PRESENT_LEMMA[surface.toLowerCase()] ?? null;
}

/** Drops past/participle surfaces and finite auxiliaries from frequency noun buckets. */
export function shouldOmitEnglishNounFrequencySurface(surface: string): boolean {
  const w = surface.toLowerCase();
  const lem = englishVerbSurfaceToPresentLemma(w);
  if (lem !== null && lem !== w) {
    return true;
  }
  if (FINITE_AUX_NO_NOUN.has(w)) {
    return true;
  }
  return false;
}
