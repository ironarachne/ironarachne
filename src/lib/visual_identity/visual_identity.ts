import type { Arms } from '$lib/heraldry/arms.js';
import type { MerchantMark } from '$lib/merchant_marks/merchant_mark_types.js';
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

export function isHeraldryEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'heraldry'; arms: Arms } {
  return emblem.kind === 'heraldry';
}

export function isMerchantMarkEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'merchant_mark'; mark: MerchantMark } {
  return emblem.kind === 'merchant_mark';
}
