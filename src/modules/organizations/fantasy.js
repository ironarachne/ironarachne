"use strict";

import * as RND from "../random.js";
import * as CommonNames from "../names/common.js";
import * as FantasyCharacter from "../characters/fantasy.js";
import Organization from "./organization.js";
import Rank from "./rank.js";
import Title from "../characters/title.js";

const random = require("random");

export function generate() {
  let orgType = randomType();
  let memberCount = random.int(orgType.minSize, orgType.maxSize);

  let org = new Organization(orgType.randomName(), orgType, orgType.randomDescription(), memberCount, orgType.randomLeadership(), orgType.getRanks());
  org.description = org.description.replace(
    "{name}",
    org.name
  );

  org.description += " It has " + org.memberCount + " members. ";
  org.description += randomPopularity();

  org.notableMembers = randomNotableMembers(org);

  org.leadership.description = "They are led by " + org.leadership.getPrimaryTitle() + " " + org.leadership.firstName + " " + org.leadership.lastName + ". " + org.leadership.description;

  return org;
}

function randomNotableMembers(org) {
  let tiers = 1;
  let rank = org.ranks;
  let notableMembers = [];

  let numberOfInferiors = rank.inferiors.length;

  while (numberOfInferiors > 0) {
    tiers++;
    rank = rank.inferiors[0];
    numberOfInferiors = rank.inferiors.length;
  }

  if (tiers <= 1) {
    return [];
  }

  for (let i = 0; i < tiers; i++) {
    let possibleRanks = org.getRanksOfTier(i);

    let numberOfMembers = 1;

    if (i == 1) {
      numberOfMembers = random.int(2, 4);
    } else if (i == 2) {
      numberOfMembers = random.int(1, 3);
    }

    if (i > 0) {
      for (let k = 0; k < numberOfMembers; k++) {
        let memberRank = RND.item(possibleRanks);

        let member = FantasyCharacter.generateByAgeGroup(memberRank.ageGroupName);
        member.titles.push(memberRank.title);
        notableMembers.push(member);
      }
    }
  }

  return notableMembers;
}

function randomPopularity() {
  return RND.item([
    "They enjoy a surprising amount of local popularity.",
    "They are not terribly popular locally.",
    "They're disliked by the local population.",
    "They're fairly popular locally but relatively unknown in the wider region.",
    "While locals are ambivalent about them, they are fairly popular in the wider region.",
    "The locals actively hate them.",
  ]);
}

function randomType() {
  return RND.item([
    {
      name: "mercenary company",
      minSize: 20,
      maxSize: 80,
      leaderTitle: "captain",
      randomName: function () {
        let prefix = RND.item([
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
        let suffix = RND.item([
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
      randomDescription: function () {
        return RND.item([
          "{name} is a vicious mercenary company with a reputation for excessive violence.",
          "{name} is a merc company that prides itself on its professionalism and integrity.",
          "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
        ]);
      },
      randomLeadership: function () {
        let leader = FantasyCharacter.generateByAgeGroup("adult");
        let ranks = this.getRanks();
        leader.titles.push(ranks.title);

        return leader;
      },
      getRanks: function () {
        let captain = new Rank(new Title("Captain", "Captain", "Captain", "Captain", false, "", 0), "military", "adult");
        let lieutenant = new Rank(new Title("Lieutenant", "Lieutenant", "Lieutenant", "Lieutenant", false, "", 1), "military", "adult");
        let sergeant = new Rank(new Title("Sergeant", "Sergeant", "Sergeant", "Sergeant", false, "", 2), "military", "adult");
        let member = new Rank(new Title("Mercenary", "Mercenary", "", "", false, "", 3), "military", "adult");

        sergeant.addInferior(member);
        lieutenant.addInferior(sergeant);
        captain.addInferior(lieutenant);
        return captain;
      }
    },
    {
      name: "trading company",
      minSize: 30,
      maxSize: 200,
      leaderTitle: "proprietor",
      randomName: function () {
        let nameTypes = [
          {
            name: "generic",
            randomName: function () {
              let prefixes = ["Dynasty", "Gilded", "Luxury"];

              let prefix = RND.item(prefixes);

              let suffix = RND.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return prefix + " " + suffix;
            },
          },
          {
            name: "geographic",
            randomName: function () {
              let direction = RND.item(["North", "West", "South", "East"]);
              let feature = RND.item(["Wind", "Sea", "Mountain", "Ocean"]);

              let suffix = RND.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return direction + " " + feature + " " + suffix;
            },
          },
          {
            name: "family",
            randomName: function () {
              let familyNames = CommonNames.lastNames();

              let familyName = RND.item(familyNames);

              let moniker = RND.item([
                " Brothers",
                " & Sons",
                " & Son",
                " Family",
                "",
              ]);

              let suffix = RND.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return familyName + " " + moniker + " " + suffix;
            },
          },
        ];

        let namer = RND.item(nameTypes);

        return namer.randomName();
      },
      randomDescription: function () {
        return RND.item([
          "The {name} is noted for the quality of their goods.",
          "The {name} has a reputation for always delivering goods to their intended destination.",
          "The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.",
          "The {name} often openly uses bullying and strong-arming in their dealings.",
          "The {name} deals in a wide variety of goods.",
        ]);
      },
      randomLeadership: function () {
        let leader = FantasyCharacter.generateByAgeGroup("adult");
        let ranks = this.getRanks();
        leader.titles.push(ranks.title);

        return leader;
      },
      getRanks: function () {
        let owner = new Rank(new Title("Proprietor", "Proprietor", "", "", false, "", 0), "commercial", "adult");
        let manager = new Rank(new Title("Manager", "Manager", "", "", false, "", 1), "commercial", "adult");
        let employee = new Rank(new Title("Employee", "Employee", "", "", false, "", 2), "commercial", "adult");

        manager.addInferior(employee);
        owner.addInferior(manager);
        return owner;
      }
    },
    {
      name: "wizard school",
      minSize: 100,
      maxSize: 600,
      leaderTitle: "headmaster",
      randomName: function () {
        let schoolType = RND.item(["School", "Academy", "College"]);

        let suffixTypes = [
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
              let first = [
                "Arcane",
                "Mystical",
                "Eldritch",
                "Occult",
              ];

              let second = [
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

        let suffixType = RND.item(suffixTypes);

        return "The " + schoolType + " of " + suffixType.generate();
      },
      randomDescription: function () {
        return RND.item([
          "{name} is a hidden wizard school that avoids contact with the outside world.",
          "{name} is a proud institution whose students primarily come from the nobility.",
          "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
          "{name} is an egalitarian wizard school that accepts new students from every walk of life.",
        ]);
      },
      randomLeadership: function () {
        let leader = FantasyCharacter.generateByAgeGroup("elderly");
        let ranks = this.getRanks();
        leader.titles.push(ranks.title);

        return leader;
      },
      getRanks: function () {
        let headmaster = new Rank(new Title("Headmaster", "Headmaster", "Headmaster", "Headmaster", false, "", 0), "arcane", "elderly");
        let professor = new Rank(new Title("Professor", "Professor", "Professor", "Professor", false, "", 1), "arcane", "adult");
        let student = new Rank(new Title("Student", "Student", "", "", false, "", 2), "arcane", "young adult");

        professor.addInferior(student);
        headmaster.addInferior(professor);
        return headmaster;
      }
    },
  ]);
}
