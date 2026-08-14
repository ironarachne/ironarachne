import type { DiscEmblem } from '$lib/disc_emblem';
import type { Arms } from '$lib/heraldry';
import type { MerchantMark } from '$lib/merchant_marks';
import type { PatternLattice } from '$lib/pattern_lattice';
import type { VisualEmblem, VisualIdentity } from './visual_identity_types.js';

export function createEmptyVisualIdentity(): VisualIdentity {
  return {
    emblem: { kind: 'none' },
  };
}

export function withHeraldryEmblem(identity: VisualIdentity, arms: Arms): VisualIdentity {
  return {
    ...identity,
    emblem: { kind: 'heraldry', arms },
  };
}

export function withMerchantMarkEmblem(
  identity: VisualIdentity,
  mark: MerchantMark,
): VisualIdentity {
  return {
    ...identity,
    emblem: { kind: 'merchant_mark', mark },
  };
}

export function withPatternLatticeEmblem(
  identity: VisualIdentity,
  lattice: PatternLattice,
): VisualIdentity {
  return {
    ...identity,
    emblem: { kind: 'pattern_lattice', lattice },
  };
}

export function withDiscEmblem(identity: VisualIdentity, disc: DiscEmblem): VisualIdentity {
  return {
    ...identity,
    emblem: { kind: 'disc_emblem', disc },
  };
}

export function isHeraldryEmblem(emblem: VisualEmblem): emblem is { kind: 'heraldry'; arms: Arms } {
  return emblem.kind === 'heraldry';
}

export function isMerchantMarkEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'merchant_mark'; mark: MerchantMark } {
  return emblem.kind === 'merchant_mark';
}

export function isPatternLatticeEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'pattern_lattice'; lattice: PatternLattice } {
  return emblem.kind === 'pattern_lattice';
}

export function isDiscEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'disc_emblem'; disc: DiscEmblem } {
  return emblem.kind === 'disc_emblem';
}
