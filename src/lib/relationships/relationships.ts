import type { Character } from '$lib/characters';
import { RNG } from '@ironarachne/rng';
import type {
  Relationship,
  RelationshipGenerationConfig,
  RelationshipType,
} from './relationship_types';
import { applyTagFilter } from '$lib/tags';

export const relationshipTypes: RelationshipType[] = [
  {
    name: 'friend',
    reciprocalName: 'friend',
    descriptionPhraseTemplates: ['{originator} is friends with {recipient}'],
    incompatibleWithTypes: ['enemy', 'rival'],
    isOneSided: false,
    tags: ['positive', 'social'],
  },
  {
    name: 'enemy',
    reciprocalName: 'enemy',
    descriptionPhraseTemplates: ['{originator} is an enemy of {recipient}'],
    incompatibleWithTypes: ['friend', 'ally'],
    isOneSided: false,
    tags: ['negative', 'social'],
  },
  {
    name: 'mentor',
    reciprocalName: 'mentee',
    descriptionPhraseTemplates: ['{originator} mentors {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['positive', 'educational'],
  },
  {
    name: 'rival',
    reciprocalName: 'rival',
    descriptionPhraseTemplates: ['{originator} is a rival of {recipient}'],
    incompatibleWithTypes: ['friend'],
    isOneSided: false,
    tags: ['negative', 'social'],
  },
  {
    name: 'ally',
    reciprocalName: 'ally',
    descriptionPhraseTemplates: ['{originator} is an ally of {recipient}'],
    incompatibleWithTypes: ['enemy'],
    isOneSided: false,
    tags: ['positive', 'social'],
  },
  {
    name: 'spouse',
    reciprocalName: 'spouse',
    descriptionPhraseTemplates: ['{originator} is mated to {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['positive', 'familial'],
  },
  {
    name: 'parent',
    reciprocalName: 'child',
    descriptionPhraseTemplates: ['{originator} is the parent of {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['familial'],
  },
  {
    name: 'sibling',
    reciprocalName: 'sibling',
    descriptionPhraseTemplates: ['{originator} is the sibling of {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['familial'],
  },
  {
    name: 'colleague',
    reciprocalName: 'colleague',
    descriptionPhraseTemplates: ['{originator} is a colleague of {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['professional', 'social'],
  },
  {
    name: 'commander',
    reciprocalName: 'subordinate',
    descriptionPhraseTemplates: ['{originator} commands {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['professional', 'hierarchical'],
  },
  {
    name: 'subordinate',
    reciprocalName: 'commander',
    descriptionPhraseTemplates: ['{originator} is subordinate to {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: false,
    tags: ['professional', 'hierarchical'],
  },
  {
    name: 'desire',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} desires {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'hate',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} hates {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'envy',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} envies {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'admiration',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} admires {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'trust',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} trusts {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'distrust',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} distrusts {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
  {
    name: 'fear',
    reciprocalName: '',
    descriptionPhraseTemplates: ['{originator} fears {recipient}'],
    incompatibleWithTypes: [],
    isOneSided: true,
    tags: ['emotional'],
  },
];

export function generateRelationships(
  seed: string,
  characters: Character[],
  config: RelationshipGenerationConfig,
): Relationship[] {
  if (characters.length < 2) {
    return [];
  }

  const rng = new RNG(seed);
  const relationships: Relationship[] = [];

  let relationshipTypesToUse = relationshipTypes;

  if (config.tagFilter) {
    relationshipTypesToUse = applyTagFilter(relationshipTypes, config.tagFilter);
  }

  // Let's generate at most 3 relationships per character
  for (let i = 0; i < characters.length; i++) {
    const originator = characters[i];
    const numberOfRelationships = rng.int(1, Math.min(3, characters.length - 1));
    const potentialRecipients = characters.filter((_, index) => index !== i);
    const recipients = rng.randomSet(numberOfRelationships, potentialRecipients);
    for (const recipient of recipients) {
      const type = rng.item(relationshipTypesToUse);
      const relationship = {
        id: rng.randomString(16),
        originatorId: originator.id,
        recipientId: recipient.id,
        type,
        description: '',
      };
      relationship.description = generateRelationshipDescription(
        rng,
        originator.name,
        recipient.name,
        type,
      );
      relationships.push(relationship);
    }
  }

  // Now generate reciprocal relationships for any non-one-sided relationship types
  const additionalRelationships: Relationship[] = [];
  for (const relationship of relationships) {
    if (!relationship.type.isOneSided) {
      const inverseType = getInverseRelationshipType(relationship.type);
      if (inverseType) {
        const reciprocalRelationship = {
          id: rng.randomString(16),
          originatorId: relationship.recipientId,
          recipientId: relationship.originatorId,
          type: inverseType,
          description: generateRelationshipDescription(
            rng,
            characters.find((c) => c.id === relationship.recipientId)?.name || 'Unknown',
            characters.find((c) => c.id === relationship.originatorId)?.name || 'Unknown',
            inverseType,
          ),
        };
        additionalRelationships.push(reciprocalRelationship);
      }
    }
  }

  relationships.push(...additionalRelationships);

  // Now filter out any relationships that violate incompatibilities
  const validRelationships: Relationship[] = [];
  for (const relationship of relationships) {
    const originatorRelationships = validRelationships.filter(
      (r) => r.originatorId === relationship.originatorId,
    );
    const recipientRelationships = validRelationships.filter(
      (r) => r.originatorId === relationship.recipientId,
    );

    const originatorIncompatible = originatorRelationships.some((r) =>
      relationship.type.incompatibleWithTypes.includes(r.type.name),
    );
    const recipientIncompatible = recipientRelationships.some((r) =>
      relationship.type.incompatibleWithTypes.includes(r.type.name),
    );

    if (!originatorIncompatible && !recipientIncompatible) {
      validRelationships.push(relationship);
    }
  }

  return validRelationships;
}

export function generateRelationshipDescription(
  rng: RNG,
  originatorName: string,
  recipientName: string,
  type: RelationshipType,
): string {
  const template = rng.item(type.descriptionPhraseTemplates);
  return template.replace('{originator}', originatorName).replace('{recipient}', recipientName);
}

export function getInverseRelationshipType(type: RelationshipType): RelationshipType | null {
  const inverseType = relationshipTypes.find((t) => t.name === type.reciprocalName);
  return inverseType || null;
}
