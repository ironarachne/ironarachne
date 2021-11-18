"use strict";

import * as Charges from "../../heraldry/charges";
import * as FantasyCharacter from "../../characters/fantasy";
import * as Heraldry from "../../heraldry/heraldry";
import Rank from "../rank";
import Title from "../../characters/title";
import OrganizationType from "../type";
import * as RND from "../../random";

export function generateType(): OrganizationType {
  let config = Heraldry.getDefaultConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(['book', 'magic', 'monster'], Charges.all());

  let school = new OrganizationType(
    "wizard school",
    100,
    600,
    "headmaster",
    function () {
      const schoolType = RND.item(["School", "Academy", "College"]);

      const suffixTypes = [
        {
          generate: function () {
            return RND.item([
              "Witchcraft",
              "Wizardry",
              "Sorcery",
              "Mysticism",
            ]);
          },
        },
        {
          generate: function () {
            const first = [
              "Arcane",
              "Mystical",
              "Eldritch",
              "Occult",
            ];

            const second = [
              "Arts",
              "Sciences",
              "Paths",
              "Ways",
              "Secrets",
            ];

            return RND.item(first) + " " + RND.item(second);
          }
        }
      ];

      const suffixType = RND.item(suffixTypes);

      return "The " + schoolType + " of " + suffixType.generate();
    },
    function () {
      return RND.item([
        "{name} is a hidden wizard school that avoids contact with the outside world.",
        "{name} is a proud institution whose students primarily come from the nobility.",
        "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
        "{name} is an egalitarian wizard school that accepts new students from every walk of life.",
      ]);
    },
    function (this:OrganizationType) {
      const leader = FantasyCharacter.generateByAgeGroup("elderly");
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function () {
      const headmaster = new Rank(new Title("Headmaster", "Headmaster", "Headmaster", "Headmaster", false, "", 0), "arcane", "elderly");
      const professor = new Rank(new Title("Professor", "Professor", "Professor", "Professor", false, "", 1), "arcane", "adult");
      const student = new Rank(new Title("Student", "Student", "", "", false, "", 2), "arcane", "young adult");

      professor.addInferior(student);
      headmaster.addInferior(professor);
      return headmaster;
    },
    config
  );

  return school;
}
