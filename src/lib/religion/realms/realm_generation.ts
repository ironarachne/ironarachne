import { RNG } from '@ironarachne/rng';
import type { DivineRealm, DivineRealmGenerationConfig, DivineRealmRole } from './realm_types';

import { divineRealmTypes } from './realm_data';

export function generate(seed: string, config: DivineRealmGenerationConfig): DivineRealm[] {
  const rng = new RNG(seed);

  // Filter possible types based on config
  let possibleTypes = config.possibleTypes.length > 0 ? config.possibleTypes : divineRealmTypes;

  // Shuffle possible types
  possibleTypes = rng.shuffle([...possibleTypes]);

  // Determine number of realms
  const numRealms = rng.int(config.minNumberOfRealms, config.maxNumberOfRealms);

  const realms = [];

  for (let i = 0; i < numRealms && possibleTypes.length > 0; i++) {
    const type = possibleTypes.pop();
    if (!type) break;

    // Pick a biome if available
    let biome = undefined;
    if (type.biomeOptions && type.biomeOptions.length > 0) {
      biome = rng.item(type.biomeOptions);
    }

    // Determine role
    let role: string = 'divine abode';
    if (type.canBeAfterlife && config.hasAfterlife) {
      if (type.afterlifeType === 'reward') role = 'reward afterlife';
      else if (type.afterlifeType === 'punishment') role = 'punishment afterlife';
      else if (type.afterlifeType === 'neutral') role = 'neutral afterlife';
    } else if (type.canBeMortalRealm && config.hasDivineAbode === false) {
      role = 'mortal realm';
    }

    const realm: DivineRealm = {
      name: type.nameGenerator(seed + i),
      description: type.descriptionGenerator(seed + i),
      mutators: type.mutators,
      biome,
      role: role as DivineRealmRole,
    };
    realms.push(realm);
  }

  return realms;
}
