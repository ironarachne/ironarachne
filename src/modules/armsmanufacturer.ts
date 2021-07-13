"use strict";

import * as RND from "./random";
import * as InventedNames from "./names/invented";
import * as SciFiWeaponTypes from "./weapons/scifi";
import * as Weapons from "./weapons/weapons";
import Weapon from "./weapons/weapon";
import random from "random";

export class ArmsManufacturer {
  name: string;
  description: string;
  models: Weapon[];

  constructor(name: string, description: string, models: Weapon[]) {
    this.name = name;
    this.description = description;
    this.models = models;
  }
}

export function generate(): ArmsManufacturer {
  const name = randomName();

  let description = `${name} `;

  const specialty = randomSpecialty();
  const secondary = randomSpecialty();

  description += RND.item([
    ` specializes in ${specialty.name}s. `,
    ` is known for their ${specialty.name}s. `,
  ]);

  description += randomOutlook();
  description += randomReputation();

  let models = [];

  let nameGenerator = randomWeaponNameGenerator();

  const numberOfPrimary = random.int(3,4);

  for (let i=0;i<numberOfPrimary;i++) {
    let model = Weapons.generate(specialty, name);
    model.name = nameGenerator() + ` ${specialty.name}`;
    models.push(model);
  }

  const numberOfSecondary = random.int(0,2);

  for (let i=0;i<numberOfSecondary;i++) {
    let model = Weapons.generate(secondary, name);
    model.name = nameGenerator() + ` ${secondary.name}`;
    models.push(model);
  }

  return new ArmsManufacturer(name, description, models);
}

function randomSpecialty() {
  return RND.item(SciFiWeaponTypes.allTypes());
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
  const patterns = [
    "pvlul",
    "vpvfv",
  ];

  let nameFragment = InventedNames.generate(patterns);

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
      const patterns = [
        "v",
        "c",
        "cc",
        "pc",
        "vc",
        "ccc",
      ];

      const nameFragment = InventedNames.generate(patterns);

      const suffix = "-" + random.int(1, 99);

      return nameFragment + suffix;
    },
    () => {
      const patterns = [
        "v",
        "c",
      ];

      const nameFragment = InventedNames.generate(patterns);

      const suffix = "" + random.int(1, 99);

      return nameFragment + suffix;
    },
    () => {
      const patterns = [
        "v",
        "c",
      ];

      const nameFragment = InventedNames.generate(patterns);

      const suffix = "-" + random.int(1, 99);

      return nameFragment + suffix;
    },
  ])
}
