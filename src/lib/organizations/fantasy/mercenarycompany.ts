"use strict";

import * as RND from "@ironarachne/rng";
import Character from "../../characters/character.js";
import CharacterGenerator from "../../characters/generator.js";
import * as PremadeConfigs from "../../characters/premadeconfigs.js";
import Title from "../../characters/title.js";
import * as Charges from "../../heraldry/charges.js";
import HeraldryGeneratorConfig from "../../heraldry/generatorconfig.js";
import Rank from "../rank.js";
import OrganizationType from "../type.js";

export function generateType(): OrganizationType {
  let config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(["weapon", "armor", "aggressive"], Charges.all());

  let company = new OrganizationType(
    "mercenary company",
    20,
    80,
    "captain",
    function(): string {
      const prefix = RND.item([
        "Black",
        "Blood",
        "Burning",
        "Crimson",
        "Free",
        "Gilded",
        "Golden",
        "Iron",
        "Red",
        "Silver",
        "White",
      ]);
      const suffix = RND.item([
        "Axes",
        "Army",
        "Bears",
        "Blades",
        "Coins",
        "Company",
        "Dragons",
        "Giants",
        "Lords",
        "Pikes",
        "Sentinels",
        "Swords",
        "Wolves",
        "Wyverns",
      ]);

      return "The " + prefix + " " + suffix;
    },
    function(): string {
      return RND.item([
        "{name} is a vicious mercenary company with a reputation for excessive violence.",
        "{name} is a merc company that prides itself on its professionalism and integrity.",
        "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
      ]);
    },
    function(this: OrganizationType): Character {
      let charGenConfig = PremadeConfigs.getFantasy();
      charGenConfig.ageCategories = ["adult"];

      const charGen = new CharacterGenerator(charGenConfig);
      const leader = charGen.generate();
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function(): Rank {
      const captain = new Rank(
        new Title("Captain", "Captain", "Captain", "Captain", false, "", 0),
        "military",
        "adult",
      );
      const lieutenant = new Rank(
        new Title("Lieutenant", "Lieutenant", "Lieutenant", "Lieutenant", false, "", 1),
        "military",
        "adult",
      );
      const sergeant = new Rank(
        new Title("Sergeant", "Sergeant", "Sergeant", "Sergeant", false, "", 2),
        "military",
        "adult",
      );
      const member = new Rank(
        new Title("Mercenary", "Mercenary", "", "", false, "", 3),
        "military",
        "adult",
      );

      sergeant.addInferior(member);
      lieutenant.addInferior(sergeant);
      captain.addInferior(lieutenant);
      return captain;
    },
    config,
  );

  return company;
}
