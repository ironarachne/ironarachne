import * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';
import { getDefaultConfig } from '$lib/weapons/config.js';
import { generate as generateWeapon } from '$lib/weapons/generator.js';
import * as SciFiWeaponTypes from '$lib/weapons/scifi.js';
import type { Weapon } from '$lib/weapons/weapons.js';
import type { ArmsManufacturer } from './arms_manufacturer.js';

export function generate(rng: RNG): ArmsManufacturer {
  const name = randomName(rng);

  let description = `${name} `;

  const specialty = rng.item(SciFiWeaponTypes.all);
  const secondaryOptions = SciFiWeaponTypes.all.filter((wType) => wType.name !== specialty.name);

  const secondary = rng.item(secondaryOptions);

  description += rng.item([
    ` specializes in ${specialty.name}s. `,
    ` is known for their ${specialty.name}s. `,
  ]);

  description += randomOutlook(rng);
  description += randomReputation(rng);

  const config = getDefaultConfig(rng);
  const models: Weapon[] = [];

  config.weaponTypes = [specialty];

  const numberOfPrimary = rng.int(3, 4);

  for (let i = 0; i < numberOfPrimary; i++) {
    models.push(generateWeapon(config));
  }

  config.weaponTypes = [secondary];

  const numberOfSecondary = rng.int(0, 2);

  for (let i = 0; i < numberOfSecondary; i++) {
    models.push(generateWeapon(config));
  }

  return { name, description, models };
}

export function randomOutlook(rng: RNG): string {
  return rng.item([
    ' They focus exclusively on quality, and their products are very expensive.',
    ' They focus heavily on reliability.',
    ' They are devoted to profit above all else and their products are lower in quality.',
    ' They pride themselves on their workmanship.',
  ]);
}

export function randomReputation(rng: RNG): string {
  return rng.item([
    ' Their products are widely regarded as the standard to beat.',
    ' Their products have a following among bounty hunters and mercenaries.',
    ' Their products are well-regarded by military powers.',
    ' They sometimes suffer derision because of their attitude.',
    ' Their market presence is almost nonexistent.',
    ' Some black markets focus exclusively on their products.',
  ]);
}

export function randomName(rng: RNG): string {
  const patterns = ['pvlul', 'vpvfv'];

  const nameGenerator = MUN.getNameGeneratorForPatternSet('arms_manufacturer', patterns, rng);
  const nameFragment = nameGenerator.generate(1)[0];

  const suffixes = [
    'Heavy Industries',
    'Arms, Limited',
    'Incorporated',
    'Consolidated',
    'Corporation',
    'Applied Sciences',
  ];

  const suffix = rng.item(suffixes);

  return `${nameFragment} ${suffix}`;
}
