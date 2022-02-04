'use strict';

import RealmConcept from './realmconcept';

export function all(): RealmConcept[] {
  return [
    new RealmConcept(
      'sky',
      ['The Eternal Heavens', 'The Heavens Above', 'Heaven', 'The Sky', 'The Heavens'],
      ['sky'],
      ['mercurial', 'caring', 'wise', 'flexible'],
      [
        'Far above the mortal world, {name} is a realm of light.',
        '{name} is a realm of light and beauty.',
      ],
    ),
    new RealmConcept(
      'earth',
      ['The Earth', 'The Mortal Realm', 'The Material Plane'],
      ['earth'],
      ['stable', 'stubborn', 'physical'],
      ['{name} is where mortals reside.', '{name} is the home of all mortal beings.'],
    ),
    new RealmConcept(
      'forest',
      ['The Forest', 'The Eternal Forest', 'The Divine Forest'],
      ['forest'],
      ['caring', 'stable', 'peaceful'],
      [
        'Hidden far from the mortal world, {name} is deep and mysterious.',
        '{name} is an infinite forest of beauty and mystery.',
      ],
    ),
    new RealmConcept(
      'underworld',
      ['The Underworld', 'The Afterlife', 'The Kingdom of Death', 'The Great Beyond'],
      ['death', 'shadow'],
      ['angry', 'brooding', 'peaceful', 'wise'],
      [
        '{name} is where souls go to rest after death.',
        '{name} is a realm of perpetual darkness where the dead rest forever.',
      ],
    ),
    new RealmConcept(
      'ocean',
      ['The Vast Sea', 'The Sea', 'The Endless Ocean', 'The Divine Sea'],
      ['water'],
      ['mercurial', 'aloof', 'cruel', 'flexible'],
      [
        '{name} is a realm apart from mortal seas, full of life and infinitely deep.',
        'The deep and restless waters of {name} hide many secrets.',
      ],
    ),
    new RealmConcept(
      'mountain',
      ['The Great Mountain', 'The Mountain', 'The Divine Mountain'],
      ['earth'],
      ['aloof', 'wise', 'physical', 'stable'],
      [
        '{name} is far larger than any mountain of the mortal world.',
        '{name} is covered in lush forests and cascading waterfalls, a towering paradise.',
      ],
    ),
    new RealmConcept(
      'void',
      ['The Nameless Void', 'The Endless Void', 'The Void', 'The Dark Beyond', 'The Endless Dark'],
      ['alien'],
      ['alien', 'clever'],
      [
        '{name} is home to things unknowable and alien.',
        'There are mysteries in {name} that no mortal can hope to perceive, let alone understand.',
      ],
    ),
  ];
}
