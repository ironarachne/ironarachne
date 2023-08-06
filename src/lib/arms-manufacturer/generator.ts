"use strict";

import WeaponGeneratorConfig from "$lib/weapons/config.js";
import WeaponGenerator from "$lib/weapons/generator.js";
import * as SciFiWeaponTypes from "$lib/weapons/scifi.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import ArmsManufacturer from "./armsmanufacturer.js";

export default class ArmsManufacturerGenerator {
  generate(): ArmsManufacturer {
    return generate();
  }
}

function generate(): ArmsManufacturer {
  const name = randomName();

  let description = `${name} `;

  const specialty = RND.item(SciFiWeaponTypes.all);
  let secondaryOptions = SciFiWeaponTypes.all.filter((wType) => wType.name !== specialty.name);

  const secondary = RND.item(secondaryOptions);

  description += RND.item([
    ` specializes in ${specialty.name}s. `,
    ` is known for their ${specialty.name}s. `,
  ]);

  description += randomOutlook();
  description += randomReputation();

  let models = [];

  const numberOfPrimary = random.int(3, 4);

  let generator = new WeaponGenerator();
  let config = new WeaponGeneratorConfig();
  config.weaponTypes = [specialty];
  generator.config = config;

  for (let i = 0; i < numberOfPrimary; i++) {
    let model = generator.generate();
    models.push(model);
  }

  config.weaponTypes = [secondary];
  generator.config = config;

  const numberOfSecondary = random.int(0, 2);

  for (let i = 0; i < numberOfSecondary; i++) {
    let model = generator.generate();
    models.push(model);
  }

  return new ArmsManufacturer(name, description, models);
}

function randomOutlook(): string {
  return RND.item([
    " They focus exclusively on quality, and their products are very expensive.",
    " They focus heavily on reliability.",
    " They are devoted to profit above all else and their products are lower in quality.",
    " They pride themselves on their workmanship.",
  ]);
}

function randomReputation(): string {
  return RND.item([
    " Their products are widely regarded as the standard to beat.",
    " Their products have a following among bounty hunters and mercenaries.",
    " Their products are well-regarded by military powers.",
    " They sometimes suffer derision because of their attitude.",
    " Their market presence is almost nonexistent.",
    " Some black markets focus exclusively on their products.",
  ]);
}

function randomName() {
  const patterns = ["pvlul", "vpvfv"];

  let nameFragment = MUN.invent(patterns);

  const suffixes = [
    "Heavy Industries",
    "Arms, Limited",
    "Incorporated",
    "Consolidated",
    "Corporation",
    "Applied Sciences",
  ];

  let suffix = RND.item(suffixes);

  return `${nameFragment} ${suffix}`;
}

function randomWeaponNameGenerator() {
  return RND.item([
    () => {
      const patterns = ["v", "c", "cc", "pc", "vc", "ccc"];

      const nameFragment = MUN.invent(patterns);

      const suffix = "-" + random.int(1, 99);

      return nameFragment + suffix;
    },
    () => {
      const patterns = ["v", "c"];

      const nameFragment = MUN.invent(patterns);

      const suffix = "" + random.int(1, 99);

      return nameFragment + suffix;
    },
    () => {
      const patterns = ["v", "c"];

      const nameFragment = MUN.invent(patterns);

      const suffix = "-" + random.int(1, 99);

      return nameFragment + suffix;
    },
  ]);
}
