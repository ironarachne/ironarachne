import { RNG } from '@ironarachne/rng';

import type { TaggedItem } from '$lib/tags';

export type Mutator<T> = TaggedItem & {
  name: string;
  mutate: (seed: string, target: T) => T;
};

export function applyMutators<T>(seed: string, target: T, mutators: Mutator<T>[]): T {
  const rng = new RNG(seed);

  let mutatedTarget = target;

  for (const mutator of mutators) {
    mutatedTarget = mutator.mutate(rng.randomString(16), mutatedTarget);
  }

  return mutatedTarget;
}
