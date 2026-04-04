import ArmsManufacturer from './arms_manufacturer.js';
import WeaponGenerator from '$lib/weapons/generator.js';
import WeaponGeneratorConfig from '$lib/weapons/config.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RNG from '@ironarachne/rng';
import * as SciFiWeaponTypes from '$lib/weapons/scifi.js';

export default class ArmsManufacturerGenerator {
  rng: RNG.RNG;

  constructor(rng: RNG.RNG = new RNG.RNG(Date.now())) {
    this.rng = rng;
  }

  generate(): ArmsManufacturer {
    const name = this.randomName();

    let description = `${name} `;

    const specialty = this.rng.item(SciFiWeaponTypes.all);
    const secondaryOptions = SciFiWeaponTypes.all.filter((wType) => wType.name !== specialty.name);

    const secondary = this.rng.item(secondaryOptions);

    description += this.rng.item([
      ` specializes in ${specialty.name}s. `,
      ` is known for their ${specialty.name}s. `,
    ]);

    description += this.randomOutlook();
    description += this.randomReputation();

    const models = [];

    const numberOfPrimary = this.rng.int(3, 4);

    const generator = new WeaponGenerator(this.rng);
    const config = new WeaponGeneratorConfig(this.rng);
    config.weaponTypes = [specialty];
    generator.config = config;

    for (let i = 0; i < numberOfPrimary; i++) {
      const model = generator.generate();
      models.push(model);
    }

    config.weaponTypes = [secondary];
    generator.config = config;

    const numberOfSecondary = RNG.int(0, 2);

    for (let i = 0; i < numberOfSecondary; i++) {
      const model = generator.generate();
      models.push(model);
    }

    return new ArmsManufacturer(name, description, models);
  }

  randomOutlook(): string {
    return this.rng.item([
      ' They focus exclusively on quality, and their products are very expensive.',
      ' They focus heavily on reliability.',
      ' They are devoted to profit above all else and their products are lower in quality.',
      ' They pride themselves on their workmanship.',
    ]);
  }

  randomReputation(): string {
    return this.rng.item([
      ' Their products are widely regarded as the standard to beat.',
      ' Their products have a following among bounty hunters and mercenaries.',
      ' Their products are well-regarded by military powers.',
      ' They sometimes suffer derision because of their attitude.',
      ' Their market presence is almost nonexistent.',
      ' Some black markets focus exclusively on their products.',
    ]);
  }

  randomName() {
    const patterns = ['pvlul', 'vpvfv'];

    const nameGenerator = MUN.getNameGeneratorForPatternSet(
      'arms_manufacturer',
      patterns,
      this.rng,
    );
    const nameFragment = nameGenerator.generate(1)[0];

    const suffixes = [
      'Heavy Industries',
      'Arms, Limited',
      'Incorporated',
      'Consolidated',
      'Corporation',
      'Applied Sciences',
    ];

    const suffix = this.rng.item(suffixes);

    return `${nameFragment} ${suffix}`;
  }
}
