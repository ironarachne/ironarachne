import type { ReligionCategory } from '../religion_types';

export const monotheism: ReligionCategory = {
  name: 'monotheism',
  description: 'This religion has a single all-powerful god.',
  hasDeities: true,
  hasLeader: false,
  minDeities: 1,
  maxDeities: 1,
  dimensionHints: {
    doctrinal: { favoredAuthorities: ['scripture', 'revelation', 'tradition'] },
    mythological: { favoredStoryKinds: ['creation', 'cosmological', 'moral'] },
    institutional: { favoredStructures: ['hierarchical', 'congregational'] },
    experiential: { favoredEmphases: ['conversion', 'mystical', 'restrained'] },
  },
};

export const polytheism: ReligionCategory = {
  name: 'polytheism',
  description: 'This religion has multiple deities.',
  hasDeities: true,
  hasLeader: false,
  minDeities: 2,
  maxDeities: 20,
  dimensionHints: {
    mythological: { favoredStoryKinds: ['hero', 'creation', 'cosmological'] },
    institutional: { favoredStructures: ['hierarchical', 'diffuse'] },
    material: { emphasizeSacredObjects: true },
  },
};

export const animism: ReligionCategory = {
  name: 'animism',
  description: 'This religion believes that spirits inhabit natural objects and phenomena.',
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
  dimensionHints: {
    experiential: { favoredEmphases: ['mystical', 'vision', 'mixed'] },
    material: { emphasizeSacredObjects: true },
    doctrinal: { favoredAuthorities: ['tradition', 'revelation', 'syncretic'] },
    ritual: { favoredPractices: ['seasonal_festival', 'pilgrimage', 'communal_meal'] },
  },
};

export const totemism: ReligionCategory = {
  name: 'totemism',
  description: 'This religion reveres a particular animal or natural object as a spiritual emblem.',
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
  dimensionHints: {
    mythological: { favoredStoryKinds: ['hero', 'moral', 'cosmological'] },
    material: { emphasizeSacredObjects: true },
    ethical: { favoredFramings: ['community_harmony', 'reciprocity'] },
    ritual: { favoredPractices: ['initiation_rite', 'seasonal_festival'] },
  },
};

export const ancestorWorship: ReligionCategory = {
  name: 'ancestor worship',
  description: 'This religion involves rituals and practices to honor deceased ancestors.',
  hasDeities: false,
  hasLeader: false,
  minDeities: 0,
  maxDeities: 0,
  dimensionHints: {
    mythological: { favoredStoryKinds: ['moral', 'hero'] },
    ethical: { favoredFramings: ['community_harmony', 'divine_command', 'reciprocity'] },
    ritual: { favoredPractices: ['communal_meal', 'seasonal_festival', 'sacrifice'] },
    institutional: { favoredStructures: ['congregational', 'diffuse'] },
  },
};

export const shamanism: ReligionCategory = {
  name: 'shamanism',
  description: 'This religion centers around shamans who interact with the spirit world.',
  hasDeities: false,
  hasLeader: true,
  minDeities: 0,
  maxDeities: 0,
  dimensionHints: {
    experiential: { favoredEmphases: ['vision', 'mystical', 'conversion'] },
    institutional: { favoredStructures: ['diffuse', 'hierarchical'] },
    ritual: { preferLeaderLed: true, favoredPractices: ['chanting', 'meditation', 'pilgrimage'] },
    doctrinal: { favoredAuthorities: ['revelation', 'tradition'] },
  },
};

export function all(): ReligionCategory[] {
  return [monotheism, polytheism, animism, totemism, ancestorWorship, shamanism];
}

export function byName(name: string, categories: ReligionCategory[]): ReligionCategory {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].name === name) {
      return categories[i];
    }
  }

  throw new Error(`No religion category found with name ${name}.`);
}
