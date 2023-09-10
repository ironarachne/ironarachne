import type Character from "$lib/characters/character.js";
import * as Characters from "$lib/characters/characters.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import * as Charges from "$lib/heraldry/charges.js";
import HeraldryGeneratorConfig from "$lib/heraldry/generatorconfig.js";
import * as RND from "@ironarachne/rng";
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
      charGenConfig.ageCategoryNames = ["elderly"];

      const leader = Characters.generate(charGenConfig);
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function() {
      const headmaster = new Rank(
        {
          femaleTitle: "Headmaster",
          maleTitle: "Headmaster",
          femaleHonorific: "Headmaster",
          maleHonorific: "Headmaster",
          hasLands: false,
          landName: "",
          precedence: 0,
        },
        "arcane",
        ["elderly"],
      );
      const professor = new Rank(
        {
          femaleTitle: "Professor",
          maleTitle: "Professor",
          femaleHonorific: "Professor",
          maleHonorific: "Professor",
          hasLands: false,
          landName: "",
          precedence: 1,
        },
        "arcane",
        ["adult", "elderly"],
      );
      const student = new Rank(
        {
          femaleTitle: "Student",
          maleTitle: "Student",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 2,
        },
        "arcane",
        ["teenager", "young adult"],
      );

      professor.addInferior(student);
      headmaster.addInferior(professor);
      return headmaster;
    },
    config,
  );

  return school;
}
