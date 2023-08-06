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
  config.chargeOptions = Charges.matchingAnyTags(["book", "magic", "monster"], Charges.all());

  let school = new OrganizationType(
    "wizard school",
    100,
    600,
    "headmaster",
    function() {
      const schoolType = RND.item(["School", "Academy", "College"]);

      const suffixTypes = [
        {
          generate: function(): string {
            return RND.item(["Witchcraft", "Wizardry", "Sorcery", "Mysticism"]);
          },
        },
        {
          generate: function(): string {
            const first = ["Arcane", "Mystical", "Eldritch", "Occult"];

            const second = ["Arts", "Sciences", "Paths", "Ways", "Secrets"];

            return RND.item(first) + " " + RND.item(second);
          },
        },
      ];

      const suffixType = RND.item(suffixTypes);

      return "The " + schoolType + " of " + suffixType.generate();
    },
    function(): string {
      return RND.item([
        "{name} is a hidden wizard school that avoids contact with the outside world.",
        "{name} is a proud institution whose students primarily come from the nobility.",
        "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
        "{name} is an egalitarian wizard school that accepts new students from every walk of life.",
      ]);
    },
    function(this: OrganizationType): Character {
      let charGenConfig = PremadeConfigs.getFantasy();
      charGenConfig.ageCategories = ["elderly"];

      const charGen = new CharacterGenerator(charGenConfig);
      const leader = charGen.generate();
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function() {
      const headmaster = new Rank(
        new Title("Headmaster", "Headmaster", "Headmaster", "Headmaster", false, "", 0),
        "arcane",
        "elderly",
      );
      const professor = new Rank(
        new Title("Professor", "Professor", "Professor", "Professor", false, "", 1),
        "arcane",
        "adult",
      );
      const student = new Rank(
        new Title("Student", "Student", "", "", false, "", 2),
        "arcane",
        "young adult",
      );

      professor.addInferior(student);
      headmaster.addInferior(professor);
      return headmaster;
    },
    config,
  );

  return school;
}
