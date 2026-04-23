import type { Arms } from '$lib/heraldry/arms.js';
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

export function isHeraldryEmblem(
  emblem: VisualEmblem,
): emblem is { kind: 'heraldry'; arms: Arms } {
  return emblem.kind === 'heraldry';
}
