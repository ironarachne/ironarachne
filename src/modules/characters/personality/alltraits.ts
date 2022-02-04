'use strict';

import PersonalityTrait from './personalitytrait';

export function all(): PersonalityTrait[] {
  return [
    new PersonalityTrait('aggressiveness', 'passive', 'belligerent'),
    new PersonalityTrait('altruism', 'selfish', 'selfless'),
    new PersonalityTrait('bravery', 'cowardly', 'brave'),
    new PersonalityTrait('competitiveness', 'cooperative', 'competitive'),
    new PersonalityTrait('confidence', 'uncertain', 'confident'),
    new PersonalityTrait('creativity', 'unimaginative', 'creative'),
    new PersonalityTrait('eloquence', 'plain-spoken', 'eloquent'),
    new PersonalityTrait('friendliness', 'aloof', 'friendly'),
    new PersonalityTrait('honesty', 'dishonest', 'honest'),
    new PersonalityTrait('industriousness', 'lazy', 'hard-working'),
    new PersonalityTrait('intelligence', 'stupid', 'smart'),
    new PersonalityTrait('kindness', 'cruel', 'kind'),
    new PersonalityTrait('loyalty', 'disloyal', 'loyal'),
    new PersonalityTrait('optimism', 'pessimistic', 'optimistic'),
    new PersonalityTrait('politeness', 'rude', 'polite'),
    new PersonalityTrait('thoughtfulness', 'unthinking', 'thoughtful'),
    new PersonalityTrait('tolerance', 'intolerant', 'tolerant'),
    new PersonalityTrait('wisdom', 'foolish', 'wise'),
  ];
}
