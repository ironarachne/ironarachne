'use strict';

import RealmConcept from './realmconcept';

export function all(): RealmConcept[] {
  return [
    new RealmConcept(
      'sky',
      [
        'The Eternal Heavens',
        'The Heavens Above',
        'Heaven',
        'The Sky',
        'The Heavens',
        'The Celestial Realm',
        'The Empyrean',
        'The Firmament',
      ],
      ['sky', 'clouds', 'sun', 'moon', 'stars', 'rainbows', 'light'],
      ['mercurial', 'caring', 'wise', 'flexible', 'majestic', 'powerful', 'graceful', 'serene'],
      [
        'Far above the mortal world, {name} is a realm of light and splendor.',
        '{name} is a realm of light and beauty, where celestial beings roam.',
        'The skies of {name} are awash with vibrant colors and shimmering stars.',
      ],
    ),
    new RealmConcept(
      'earth',
      [
        'The Earth',
        'The Mortal Realm',
        'The Material Plane',
        'The Mundane World',
        'The Physical Plane',
        'The Human World',
      ],
      ['earth', 'mountains', 'rivers', 'forests', 'deserts', 'oceans', 'caves', 'valleys'],
      ['stable', 'stubborn', 'physical', 'grounded', 'tenacious', 'reliable', 'practical'],
      [
        '{name} is where mortals reside, going about their daily lives.',
        '{name} is the home of all mortal beings, full of bustling cities and quiet countryside.',
      ],
    ),
    new RealmConcept(
      'forest',
      [
        'The Forest',
        'The Eternal Forest',
        'The Divine Forest',
        'The Sylvan Realm',
        'The Verdant Wilds',
        'The Green Domain',
      ],
      ['forest', 'trees', 'plants', 'animals', 'rivers', 'mountains'],
      ['caring', 'stable', 'peaceful', 'graceful', 'majestic', 'wise', 'mystical'],
      [
        'Hidden far from the mortal world, {name} is deep and mysterious, full of secrets and ancient magic.',
        '{name} is an infinite forest of beauty and mystery, where the spirits of the wild roam free.',
        'The forests of {name} are alive with the sound of birdsong and rustling leaves.',
      ],
    ),
    new RealmConcept(
      'underworld',
      [
        'The Underworld',
        'The Afterlife',
        'The Kingdom of Death',
        'The Great Beyond',
        'The Netherworld',
        'The Land of the Dead',
      ],
      ['death', 'shadow', 'bones', 'ghosts', 'souls', 'void'],
      ['angry', 'brooding', 'peaceful', 'wise', 'merciful', 'judgmental', 'powerful'],
      [
        '{name} is where souls go to rest after death, guided by the spirits of the departed.',
        '{name} is a realm of perpetual darkness where the dead rest forever, watched over by the reapers of the underworld.',
        'The halls of {name} are filled with the whispers of the dead, their spirits forever lingering in the shadows.',
      ],
    ),
    new RealmConcept(
      'ocean',
      [
        'The Vast Sea',
        'The Sea',
        'The Endless Ocean',
        'The Divine Sea',
        'The Ever-Changing Tides',
        'The Fathomless Depths',
        'The Coral Kingdom',
        'The Ocean of Storms',
      ],
      ['water', 'salt', 'waves', 'foam', 'currents', 'whirlpools', 'tides', 'depths'],
      ['mercurial', 'aloof', 'cruel', 'flexible', 'violent', 'majestic', 'mysterious'],
      [
        '{name} is a realm apart from mortal seas, full of life and infinitely deep.',
        'The deep and restless waters of {name} hide many secrets.',
        'Beneath the surface of {name} lies a kingdom of wonder and terror.',
      ],
    ),
    new RealmConcept(
      'mountain',
      [
        'The Great Mountain',
        'The Mountain',
        'The Divine Mountain',
        'The Endless Peak',
        'The Celestial Summit',
        'The Sky-Splitting Colossus',
        'The Stone Sentinel',
        'The Cradle of the Gods',
      ],
      ['earth', 'rock', 'stone', 'ice', 'snow', 'summit', 'peak', 'valley'],
      ['aloof', 'wise', 'physical', 'stable', 'majestic', 'immovable', 'mysterious'],
      [
        '{name} is far larger than any mountain of the mortal world.',
        '{name} is covered in lush forests and cascading waterfalls, a towering paradise.',
        'Beneath the peaks and valleys of {name} lies a realm of fire and darkness.',
      ],
    ),
    new RealmConcept(
      'void',
      [
        'The Nameless Void',
        'The Endless Void',
        'The Void',
        'The Dark Beyond',
        'The Endless Dark',
        'The Abyss',
        'The Great Emptiness',
        'The Eternal Nothingness',
      ],
      ['alien', 'darkness', 'emptiness', 'silence', 'cold', 'nothingness', 'absence'],
      ['alien', 'clever', 'unknowable', 'silent', 'watchful', 'impenetrable'],
      [
        '{name} is home to things unknowable and alien.',
        'There are mysteries in {name} that no mortal can hope to perceive, let alone understand.',
        '{name} is a realm of eternal darkness and emptiness, where the very fabric of reality is twisted and distorted.',
      ],
    ),
    new RealmConcept(
      'dream',
      [
        'The Realm of Dreams',
        'The Dreamlands',
        'The Land of Nod',
        'The Ethereal Plane',
        'The Realm of Imagination',
        'The World of Sleep',
      ],
      ['ethereal', 'fantastical', 'dreamlike', 'otherworldly', 'surreal', 'shimmering'],
      ['mysterious', 'whimsical', 'fickle', 'curious', 'enigmatic', 'playful'],
      [
        '{name} is a place where the impossible becomes reality and where the line between dreams and waking life is blurred.',
        'The ethereal beauty of {name} is home to creatures born of pure imagination and fantasy.',
        'In {name}, the landscape constantly shifts and changes, shaped by the whims of the dreamers who call it home.',
        'The dreamscape of {name} is a realm of infinite possibilities, where anything can happen and nothing is truly impossible.',
        '{name} is a place where the innermost thoughts and desires of mortals manifest into reality, for better or for worse.',
        'Those who journey into {name} often find themselves caught in a never-ending cycle of dreams and nightmares.',
      ],
    ),
  ];
}
