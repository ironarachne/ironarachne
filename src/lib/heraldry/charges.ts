import * as RND from "@ironarachne/rng";
import type Charge from "./charge.js";
import * as Tinctures from "./tinctures.js";

import anchor from "./charge-images/anchor.svg?raw";
import antelopepassant from "./charge-images/antelope-passant.svg?raw";
import anteloperampant from "./charge-images/antelope-rampant.svg?raw";
import barrel from "./charge-images/barrel.svg?raw";
import batvolant from "./charge-images/bat-volant.svg?raw";
import battleaxe from "./charge-images/battleaxe.svg?raw";
import bearheadcouped from "./charge-images/bear-head-couped.svg?raw";
import bearrampant from "./charge-images/bear-rampant.svg?raw";
import bearstatant from "./charge-images/bear-statant.svg?raw";
import beevolant from "./charge-images/bee-volant.svg?raw";
import bell from "./charge-images/bell.svg?raw";
import boarheaderased from "./charge-images/boar-head-erased.svg?raw";
import boarpassant from "./charge-images/boar-passant.svg?raw";
import boarrampant from "./charge-images/boar-rampant.svg?raw";
import castle from "./charge-images/castle.svg?raw";
import cock from "./charge-images/cock.svg?raw";
import cockatrice from "./charge-images/cockatrice.svg?raw";
import dolphinhauriant from "./charge-images/dolphin-hauriant.svg?raw";
import doubleheadedeagledisplayed from "./charge-images/double-headed-eagle-displayed.svg?raw";
import dragonrampant from "./charge-images/dragon-rampant.svg?raw";
import eaglesheaderased from "./charge-images/eagles-head-erased.svg?raw";
import foxsejant from "./charge-images/fox-sejant.svg?raw";
import gryphonsegreant from "./charge-images/gryphon-segreant.svg?raw";
import haresalient from "./charge-images/hare-salient.svg?raw";
import hare from "./charge-images/hare.svg?raw";
import heron from "./charge-images/heron.svg?raw";
import horsepassant from "./charge-images/horse-passant.svg?raw";
import horserampant from "./charge-images/horse-rampant.svg?raw";
import leopardpassant from "./charge-images/leopard-passant.svg?raw";
import lionpassant from "./charge-images/lion-passant.svg?raw";
import lionrampant from "./charge-images/lion-rampant.svg?raw";
import lionsheaderased from "./charge-images/lions-head-erased.svg?raw";
import owl from "./charge-images/owl.svg?raw";
import pegasuspassant from "./charge-images/pegasus-passant.svg?raw";
import pegasusrampant from "./charge-images/pegasus-rampant.svg?raw";
import ramrampant from "./charge-images/ram-rampant.svg?raw";
import ramstatant from "./charge-images/ram-statant.svg?raw";
import rose from "./charge-images/rose.svg?raw";
import seahorse from "./charge-images/sea-horse.svg?raw";
import squirrel from "./charge-images/squirrel.svg?raw";
import staglodged from "./charge-images/stag-lodged.svg?raw";
import stagstatant from "./charge-images/stag-statant.svg?raw";
import suninsplendor from "./charge-images/sun-in-splendor.svg?raw";
import tigerpassant from "./charge-images/tiger-passant.svg?raw";
import tigerrampant from "./charge-images/tiger-rampant.svg?raw";
import tower from "./charge-images/tower.svg?raw";
import twoaxesinsaltire from "./charge-images/two-axes-in-saltire.svg?raw";
import twobonesinsaltire from "./charge-images/two-bones-in-saltire.svg?raw";
import unicornstatant from "./charge-images/unicorn-statant.svg?raw";
import wolfpassant from "./charge-images/wolf-passant.svg?raw";
import wolframpant from "./charge-images/wolf-rampant.svg?raw";
import wyvern from "./charge-images/wyvern.svg?raw";

export function all(): Charge[] {
  const sable = Tinctures.byName("sable");

  return [
    {
      name: "anchor",
      pluralName: "anchors",
      SVG: anchor,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "anchor",
        "ocean",
        "sea",
        "navy",
        "ship",
        "sailor",
        "coast",
        "trade",
      ],
    },
    {
      name: "antelope passant",
      pluralName: "antelopes passant",
      SVG: antelopepassant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "antelope",
        "hunting",
      ],
    },
    {
      name: "antelope rampant",
      pluralName: "antelopes rampant",
      SVG: anteloperampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "antelope",
        "hunting",
      ],
    },
    {
      name: "barrel",
      pluralName: "barrels",
      SVG: barrel,
      chargeType: "regular",
      tincture: sable,
      tags: ["barrel", "trade", "wine"],
    },
    {
      name: "bat volant",
      pluralName: "bats volant",
      SVG: batvolant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "bat",
        "evil",
        "night",
      ],
    },
    {
      name: "battleaxe",
      pluralName: "battleaxes",
      SVG: battleaxe,
      chargeType: "regular",
      tincture: sable,
      tags: ["axe", "warrior", "weapon"],
    },
    {
      name: "bear head couped",
      pluralName: "bear heads couped",
      SVG: bearheadcouped,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "bear",
        "strength",
      ],
    },
    {
      name: "bear rampant",
      pluralName: "bears rampant",
      SVG: bearrampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "bear",
        "strength",
      ],
    },
    {
      name: "bear statant",
      pluralName: "bears statant",
      SVG: bearstatant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "bear",
        "strength",
      ],
    },
    {
      name: "bee volant",
      pluralName: "bees volant",
      SVG: beevolant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "bee", "insect"],
    },
    {
      name: "bell",
      pluralName: "bells",
      SVG: bell,
      chargeType: "regular",
      tincture: sable,
      tags: ["bell", "holy"],
    },
    {
      name: "boar head erased",
      pluralName: "boar heads erased",
      SVG: boarheaderased,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "boar",
        "hunting",
      ],
    },
    {
      name: "boar passant",
      pluralName: "boars passant",
      SVG: boarpassant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "boar",
        "hunting",
      ],
    },
    {
      name: "boar rampant",
      pluralName: "boars rampant",
      SVG: boarrampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "boar",
        "hunting",
      ],
    },
    {
      name: "castle",
      pluralName: "castles",
      SVG: castle,
      chargeType: "regular",
      tincture: sable,
      tags: ["castle", "protection", "warrior"],
    },
    {
      name: "cock",
      pluralName: "cocks",
      SVG: cock,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "bird", "cock"],
    },
    {
      name: "cockatrice",
      pluralName: "cockatrices",
      SVG: cockatrice,
      chargeType: "regular",
      tincture: sable,
      tags: ["monster", "cockatrice"],
    },
    {
      name: "dolphin hauriant",
      pluralName: "dolphins hauriant",
      SVG: dolphinhauriant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "dolphin",
        "fish",
        "ocean",
      ],
    },
    {
      name: "doubleheaded eagle displayed",
      pluralName: "doubleheaded eagles displayed",
      SVG: doubleheadedeagledisplayed,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "bird", "eagle"],
    },
    {
      name: "dragon rampant",
      pluralName: "dragons rampant",
      SVG: dragonrampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "monster",
        "dragon",
      ],
    },
    {
      name: "eagle's head erased",
      pluralName: "eagle's heads erased",
      SVG: eaglesheaderased,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "bird",
        "eagle",
      ],
    },
    {
      name: "fox sejant",
      pluralName: "foxes sejant",
      SVG: foxsejant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "fox"],
    },
    {
      name: "gryphon segreant",
      pluralName: "gryphons segreant",
      SVG: gryphonsegreant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "monster",
        "griffin",
        "gryphon",
        "griffon",
      ],
    },
    {
      name: "hare salient",
      pluralName: "hares salient",
      SVG: haresalient,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "hare",
        "rabbit",
      ],
    },
    {
      name: "hare",
      pluralName: "hares",
      SVG: hare,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "hare", "rabbit"],
    },
    {
      name: "heron",
      pluralName: "herons",
      SVG: heron,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "bird", "heron"],
    },
    {
      name: "horse passant",
      pluralName: "horses passant",
      SVG: horsepassant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "horse"],
    },
    {
      name: "horse rampant",
      pluralName: "horses rampant",
      SVG: horserampant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "horse"],
    },
    {
      name: "leopard passant",
      pluralName: "leopards passant",
      SVG: leopardpassant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "cat",
        "leopard",
      ],
    },
    {
      name: "lion passant",
      pluralName: "lions passant",
      SVG: lionpassant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "cat", "lion"],
    },
    {
      name: "lion rampant",
      pluralName: "lions rampant",
      SVG: lionrampant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "cat", "lion"],
    },
    {
      name: "lion's head erased",
      pluralName: "lion's heads erased",
      SVG: lionsheaderased,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "cat",
        "lion",
      ],
    },
    {
      name: "owl",
      pluralName: "owls",
      SVG: owl,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "bird", "owl"],
    },
    {
      name: "pegasus passant",
      pluralName: "pegasuses passant",
      SVG: pegasuspassant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "monster",
        "pegasus",
      ],
    },
    {
      name: "pegasus rampant",
      pluralName: "pegasuses rampant",
      SVG: pegasusrampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "monster",
        "pegasus",
      ],
    },
    {
      name: "ram rampant",
      pluralName: "rams rampant",
      SVG: ramrampant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "ram"],
    },
    {
      name: "ram statant",
      pluralName: "rams statant",
      SVG: ramstatant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "ram"],
    },
    {
      name: "rose",
      pluralName: "roses",
      SVG: rose,
      chargeType: "regular",
      tincture: sable,
      tags: ["flower", "plant", "rose"],
    },
    {
      name: "sea horse",
      pluralName: "sea horses",
      SVG: seahorse,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "sea horse", "ocean"],
    },
    {
      name: "squirrel",
      pluralName: "squirrels",
      SVG: squirrel,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "squirrel"],
    },
    {
      name: "stag lodged",
      pluralName: "stags lodged",
      SVG: staglodged,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "stag", "hunting"],
    },
    {
      name: "stag statant",
      pluralName: "stags statant",
      SVG: stagstatant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "stag",
        "hunting",
      ],
    },
    {
      name: "sun in splendor",
      pluralName: "suns in splendor",
      SVG: suninsplendor,
      chargeType: "regular",
      tincture: sable,
      tags: ["sun"],
    },
    {
      name: "tiger passant",
      pluralName: "tigers passant",
      SVG: tigerpassant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "cat",
        "tiger",
      ],
    },
    {
      name: "tiger rampant",
      pluralName: "tigers rampant",
      SVG: tigerrampant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "animal",
        "cat",
        "tiger",
      ],
    },
    {
      name: "tower",
      pluralName: "towers",
      SVG: tower,
      chargeType: "regular",
      tincture: sable,
      tags: ["tower", "protection"],
    },
    {
      name: "two axes in saltire",
      pluralName: "axes in saltire",
      SVG: twoaxesinsaltire,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "axe",
        "warrior",
        "weapon",
      ],
    },
    {
      name: "two bones in saltire",
      pluralName: "bones in saltire",
      SVG: twobonesinsaltire,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "bone",
        "evil",
        "pirate",
      ],
    },
    {
      name: "unicorn statant",
      pluralName: "unicorns statant",
      SVG: unicornstatant,
      chargeType: "regular",
      tincture: sable,
      tags: [
        "monster",
        "unicorn",
      ],
    },
    {
      name: "wolf passant",
      pluralName: "wolves passant",
      SVG: wolfpassant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "wolf"],
    },
    {
      name: "wolf rampant",
      pluralName: "wolves rampant",
      SVG: wolframpant,
      chargeType: "regular",
      tincture: sable,
      tags: ["animal", "wolf"],
    },
    {
      name: "wyvern",
      pluralName: "wyverns",
      SVG: wyvern,
      chargeType: "regular",
      tincture: sable,
      tags: ["monster", "wyvern"],
    },
  ];
}

export function random(charges: Charge[]): Charge {
  if (charges.length === 0) {
    throw new Error("No charges provided.");
  }
  return RND.item(charges);
}

export function randomWithTag(tag: string, charges: Charge[]): Charge {
  let matching = matchingTag(tag, charges);

  return random(matching);
}

export function matchingTag(tag: string, charges: Charge[]): Charge[] {
  let result: Charge[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i]) && charges[i].tags[j] == tag) {
        result.push(charges[i]);
        continue;
      }
    }
  }

  return result;
}

export function matchingAnyTags(tags: string[], charges: Charge[]): Charge[] {
  let result: Charge[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i]) && tags.includes(charges[i].tags[j])) {
        result.push(charges[i]);
        continue;
      }
    }
  }

  return result;
}

export function allChargeTags(): string[] {
  let charges = all();

  let result: string[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i].tags[j])) {
        result.push(charges[i].tags[j]);
      }
    }
  }

  return result.sort();
}
