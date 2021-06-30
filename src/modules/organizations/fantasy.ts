"use strict";

import * as RND from "../random";
import * as CommonNames from "../names/common";
import * as FantasyCharacter from "../characters/fantasy";
import Organization from "./organization";
import Rank from "./rank";
import Title from "../characters/title";
import {OrganizationType} from "@/modules/organizations/type";

const random = require("random");

export function generate() {
  const orgType = randomType();
  const memberCount = random.int(orgType.minSize, orgType.maxSize);

  const org = new Organization(orgType.randomName(), orgType, orgType.randomDescription(), memberCount, orgType.randomLeadership(), orgType.getRanks());
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

function randomNotableMembers(org: Organization) {
  let tiers = 1;
  let rank = org.ranks;
  const notableMembers = [];

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
    const possibleRanks = org.getRanksOfTier(i);

    let numberOfMembers = 1;

    if (i == 1) {
      numberOfMembers = random.int(2, 4);
    } else if (i == 2) {
      numberOfMembers = random.int(1, 3);
    }

    if (i > 0) {
      for (let k = 0; k < numberOfMembers; k++) {
        const memberRank = RND.item(possibleRanks);

        const member = FantasyCharacter.generateByAgeGroup(memberRank.ageGroupName);
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
    new OrganizationType(
      "mercenary company",
      20,
      80,
      "captain",
      function () {
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
      function () {
        return RND.item([
          "{name} is a vicious mercenary company with a reputation for excessive violence.",
          "{name} is a merc company that prides itself on its professionalism and integrity.",
          "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
        ]);
      },
      function (this:OrganizationType) {
        const leader = FantasyCharacter.generateByAgeGroup("adult");
        const ranks = this.getRanks();
        leader.titles.push(ranks.title);

        return leader;
      },
      function () {
        const captain = new Rank(new Title("Captain", "Captain", "Captain", "Captain", false, "", 0), "military", "adult");
        const lieutenant = new Rank(new Title("Lieutenant", "Lieutenant", "Lieutenant", "Lieutenant", false, "", 1), "military", "adult");
        const sergeant = new Rank(new Title("Sergeant", "Sergeant", "Sergeant", "Sergeant", false, "", 2), "military", "adult");
        const member = new Rank(new Title("Mercenary", "Mercenary", "", "", false, "", 3), "military", "adult");

        sergeant.addInferior(member);
        lieutenant.addInferior(sergeant);
        captain.addInferior(lieutenant);
        return captain;
      }
    ),
    new OrganizationType(
      "trading company",
      30,
      200,
      "proprietor",
      function () {
        const nameTypes = [
          {
            name: "generic",
            randomName: function () {
              const prefixes = ["Dynasty", "Gilded", "Luxury"];

              const prefix = RND.item(prefixes);

              const suffix = RND.item([
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
              const direction = RND.item(["North", "West", "South", "East"]);
              const feature = RND.item(["Wind", "Sea", "Mountain", "Ocean"]);

              const suffix = RND.item([
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
              const familyNames = CommonNames.lastNames();

              const familyName = RND.item(familyNames);

              const moniker = RND.item([
                " Brothers",
                " & Sons",
                " & Son",
                " Family",
                "",
              ]);

              const suffix = RND.item([
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

        const namer = RND.item(nameTypes);

        return namer.randomName();
      },
      function () {
        return RND.item([
          "The {name} is noted for the quality of their goods.",
          "The {name} has a reputation for always delivering goods to their intended destination.",
          "The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.",
          "The {name} often openly uses bullying and strong-arming in their dealings.",
          "The {name} deals in a wide variety of goods.",
        ]);
      },
      function (this:OrganizationType) {
        const leader = FantasyCharacter.generateByAgeGroup("adult");
        const ranks = this.getRanks();
        leader.titles.push(ranks.title);

        return leader;
      },
      function () {
        const owner = new Rank(new Title("Proprietor", "Proprietor", "", "", false, "", 0), "commercial", "adult");
        const manager = new Rank(new Title("Manager", "Manager", "", "", false, "", 1), "commercial", "adult");
        const employee = new Rank(new Title("Employee", "Employee", "", "", false, "", 2), "commercial", "adult");

        manager.addInferior(employee);
        owner.addInferior(manager);
        return owner;
      }
    ),
    new OrganizationType(
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
      }
    ),
  ]);
}
