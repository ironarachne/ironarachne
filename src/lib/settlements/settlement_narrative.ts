import type { RNG } from '@ironarachne/rng';
import type { Settlement, SettlementCategory } from './settlement_types.js';

/**
 * Lines that stress crime, danger, and disorder: only appropriate when `lawAndOrder` is low.
 */
const DISORDER_CUE_PATTERN =
  /thieves|thief|assassin|unsavory|maraud|footpad|scoundrel|cutpurse|smuggl|brigand|pirate|fear and violence/i;

/**
 * Picks a category blurb that does not describe rampant crime when the settlement has high law and order.
 */
export function pickCategoryPlausibleLine(
  category: SettlementCategory,
  lawAndOrder: number,
  rng: RNG,
): string {
  const raw = category.possibleDescriptions;
  if (raw.length === 0) {
    return '';
  }
  if (lawAndOrder >= 7) {
    const fit = raw.filter((line) => !DISORDER_CUE_PATTERN.test(line));
    const pool = fit.length > 0 ? fit : raw;
    return rng.item(pool);
  }
  if (lawAndOrder <= 3) {
    return rng.item(raw);
  }
  const fit = raw.filter((line) => !DISORDER_CUE_PATTERN.test(line));
  const mix =
    fit.length > 0 ? [...fit, ...raw.filter((line) => DISORDER_CUE_PATTERN.test(line))] : raw;
  return rng.item(mix);
}

/**
 * Social texture aligned with `lawAndOrder` (replaces a reputation sentence uncorrelated with facets).
 */
export function socialToneFromFacets(settlement: Settlement, rng: RNG): string {
  const l = settlement.lawAndOrder;
  if (l >= 7) {
    return rng.item([
      'The people are known for orderliness, for using the law rather than a blade to settle scores.',
      'Folk here have a reputation for keeping the peace and for backing the local watch in a pinch.',
      'Most would rather bring a writ to a magistrate than a grudge to the tavern, and that shows in the streets.',
      'The people are regarded as law-abiding and as quick to help a neighbor in plain sight of the guard.',
    ]);
  }
  if (l <= 3) {
    return rng.item([
      'Rumor ties whispers in the alleys to more than a few stabbings and shakedowns after dark.',
      'Folk here are known for looking after their own, and for keeping a shutter half-closed to strangers.',
      'The people are regarded in gentler market towns as a touch too fond of the knife and the closed purse.',
      'Strangers are watched from doorways, and a deal without a second witness is rarer than an honest dicer.',
    ]);
  }
  return rng.item([
    'The people are known for being a mix of open hands, private grudges, and small bargains in back rooms.',
    'Folk here have a reputation for muddling through: neither paragons nor cutthroats, but careful who they trust.',
    'Most regard them as watchful enough, though a quiet coin can still move a quiet favor.',
  ]);
}
