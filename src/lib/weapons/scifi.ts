import type { WeaponType } from './weapons';

export const all: WeaponType[] = [
  {
    name: 'energy rifle',
    bases: [
      'This rifle',
      'This energy rifle',
      'This blaster rifle',
      'This energy carbine',
      'This carbine',
    ],
    cosmetics: [
      {
        name: 'barrel',
        options: ['an extended barrel', 'a short barrel', 'a grooved barrel'],
      },
      {
        name: 'scope',
        options: ['advanced sighting', 'a long scope', 'a short scope'],
      },
      {
        name: 'stock',
        options: ['a short stock', 'a clever stock', 'a comfortable stock', 'an extended stock'],
      },
      {
        name: 'trigger',
        options: ['a hair trigger', 'a double trigger', 'a comfortable trigger'],
      },
    ],
    effects: [
      {
        name: 'energy bolt',
        options: [
          'fires green bolts',
          'fires blue bolts',
          'fires red bolts',
          'fires yellow bolts',
          'fires purple bolts',
        ],
      },
      {
        name: 'sound',
        options: ['sounds like a buzzsaw', 'has a high-pitched whine', 'emits a rumbling sound'],
      },
      {
        name: 'recoil',
        options: ['kicks hard', 'has no recoil', 'has a slight recoil'],
      },
      {
        name: 'accuracy',
        options: [
          'has poor accuracy',
          'has excellent accuracy',
          'uses onboard AI to enhance accuracy',
          'has excellent accuracy',
        ],
      },
    ],
    range: 'long',
    hands: 2,
    damageType: 'energy',
  },
  {
    name: 'energy pistol',
    bases: ['This pistol', 'This energy pistol', 'This blaster pistol'],
    cosmetics: [
      {
        name: 'barrel',
        options: ['an extended barrel', 'a short barrel', 'a grooved barrel'],
      },
      {
        name: 'trigger',
        options: ['a hair trigger', 'a double trigger', 'a comfortable trigger'],
      },
      {
        name: 'grip',
        options: ['a comfortable grip', 'a synthetic hide grip', 'a biometric grip'],
      },
    ],
    effects: [
      {
        name: 'energy bolt',
        options: [
          'fires green bolts',
          'fires blue bolts',
          'fires red bolts',
          'fires yellow bolts',
          'fires purple bolts',
        ],
      },
      {
        name: 'sound',
        options: [
          'is very quiet',
          'has a high-pitched firing sound',
          'emits a low sound when it fires',
        ],
      },
      {
        name: 'recoil',
        options: ['kicks hard', 'has no recoil', 'has a slight recoil'],
      },
      {
        name: 'accuracy',
        options: ['has poor accuracy', 'has excellent accuracy', 'has good accuracy'],
      },
    ],
    range: 'short',
    hands: 1,
    damageType: 'energy',
  },
  {
    name: 'pistol',
    bases: ['This pistol', 'This revolver', 'This sidearm'],
    cosmetics: [
      {
        name: 'barrel',
        options: ['an extended barrel', 'a short barrel', 'a grooved barrel'],
      },
      {
        name: 'trigger',
        options: ['a hair trigger', 'a comfortable trigger', 'a sensitive trigger'],
      },
      {
        name: 'grip',
        options: ['a comfortable grip', 'a synthetic hide grip', 'a biometric grip'],
      },
    ],
    effects: [
      {
        name: 'ammunition',
        options: [
          'fires light rounds',
          'fires heavy rounds',
          'fires armor-piercing rounds',
          'fires incendiary rounds',
        ],
      },
      {
        name: 'sound',
        options: ['is very quiet', 'has a reverberating firing sound', 'is loud when it fires'],
      },
      {
        name: 'recoil',
        options: ['kicks hard', 'has no recoil', 'has a slight recoil'],
      },
      {
        name: 'accuracy',
        options: ['has poor accuracy', 'has excellent accuracy', 'has good accuracy'],
      },
    ],
    range: 'short',
    hands: 1,
    damageType: 'projectile',
  },
  {
    name: 'rifle',
    bases: [
      'This rifle',
      'This assault rifle',
      'This sniper rifle',
      'This assault carbine',
      'This carbine',
    ],
    cosmetics: [
      {
        name: 'barrel',
        options: ['an extended barrel', 'a short barrel', 'a grooved barrel'],
      },
      {
        name: 'scope',
        options: ['advanced sighting', 'a long scope', 'a nightvision scope', 'a short scope'],
      },
      {
        name: 'stock',
        options: [
          'a short stock',
          'a clever stock',
          'a comfortable stock',
          'an extended stock',
          'a collapsible stock',
        ],
      },
      {
        name: 'trigger',
        options: ['a hair trigger', 'a double trigger', 'a comfortable trigger'],
      },
    ],
    effects: [
      {
        name: 'ammunition',
        options: [
          'fires light rounds',
          'fires heavy rounds',
          'fires armor-piercing rounds',
          'fires anti-vehicular rounds',
          'fires incendiary rounds',
          'fires high explosive rounds',
        ],
      },
      {
        name: 'sound',
        options: [
          'sounds like a cannon',
          'has a high-pitched firing sound',
          'echoes when it fires',
        ],
      },
      {
        name: 'recoil',
        options: ['kicks hard', 'has no recoil', 'has a slight recoil'],
      },
      {
        name: 'accuracy',
        options: [
          'has poor accuracy',
          'has excellent accuracy',
          'uses onboard AI to enhance accuracy',
          'has excellent accuracy',
        ],
      },
    ],
    range: 'long',
    hands: 2,
    damageType: 'projectile',
  },
];
