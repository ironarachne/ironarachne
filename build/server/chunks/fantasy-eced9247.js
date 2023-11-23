import { o as getHonorific, g as generate$1 } from './characters-b77e95cc.js';
import { g as getFantasy } from './premade_configs-12956ef9.js';
import * as RND from '@ironarachne/rng';
import random from 'random';
import { a as HeraldryGeneratorConfig, m as matchingAnyTags, b as all$3 } from './generator-b7477695.js';
import './sentry-release-injection-file-2a50013d.js';
import * as MUN from '@ironarachne/made-up-names';

class Rank {
  title;
  inferiors;
  superior;
  classification;
  ageGroupNames;
  constructor(title, classification, ageGroupNames) {
    this.title = title;
    this.inferiors = [];
    this.superior = null;
    this.classification = classification;
    this.ageGroupNames = ageGroupNames;
  }
  addInferior(rank) {
    this.inferiors.push(rank);
  }
}
class OrganizationType {
  name;
  minSize;
  maxSize;
  leaderTitle;
  randomName;
  randomDescription;
  randomLeadership;
  getRanks;
  heraldryConfig;
  constructor(name, minSize, maxSize, leaderTitle, randomName, randomDescription, randomLeadership, getRanks, heraldryConfig) {
    this.name = name;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.leaderTitle = leaderTitle;
    this.randomName = randomName;
    this.randomDescription = randomDescription;
    this.randomLeadership = randomLeadership;
    this.getRanks = getRanks;
    this.heraldryConfig = heraldryConfig;
  }
}
function generateType$2() {
  let config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = matchingAnyTags(["weapon", "armor", "aggressive"], all$3());
  let company = new OrganizationType(
    "mercenary company",
    20,
    80,
    "captain",
    function() {
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
        "White"
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
        "Wyverns"
      ]);
      return "The " + prefix + " " + suffix;
    },
    function() {
      return RND.item([
        "{name} is a vicious mercenary company with a reputation for excessive violence.",
        "{name} is a merc company that prides itself on its professionalism and integrity.",
        "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though."
      ]);
    },
    function() {
      let charGenConfig = getFantasy();
      charGenConfig.ageCategoryNames = ["adult"];
      const leader = generate$1(charGenConfig);
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);
      return leader;
    },
    function() {
      const captain = new Rank(
        {
          femaleTitle: "Captain",
          maleTitle: "Captain",
          femaleHonorific: "Captain",
          maleHonorific: "Captain",
          hasLands: false,
          landName: "",
          precedence: 0
        },
        "military",
        ["adult"]
      );
      const lieutenant = new Rank(
        {
          femaleTitle: "Lieutenant",
          maleTitle: "Lieutenant",
          femaleHonorific: "Lieutenant",
          maleHonorific: "Lieutenant",
          hasLands: false,
          landName: "",
          precedence: 1
        },
        "military",
        ["adult"]
      );
      const sergeant = new Rank(
        {
          femaleTitle: "Sergeant",
          maleTitle: "Sergeant",
          femaleHonorific: "Sergeant",
          maleHonorific: "Sergeant",
          hasLands: false,
          landName: "",
          precedence: 2
        },
        "military",
        ["adult"]
      );
      const member = new Rank(
        {
          femaleTitle: "Mercenary",
          maleTitle: "Mercenary",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 3
        },
        "military",
        ["adult"]
      );
      sergeant.addInferior(member);
      lieutenant.addInferior(sergeant);
      captain.addInferior(lieutenant);
      return captain;
    },
    config
  );
  return company;
}
function generateType$1() {
  let config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = matchingAnyTags(["coin", "money", "trade"], all$3());
  let company = new OrganizationType(
    "trading company",
    30,
    200,
    "proprietor",
    function() {
      const nameTypes = [
        {
          name: "generic",
          randomName: function() {
            const prefixes = ["Dynasty", "Gilded", "Luxury"];
            const prefix = RND.item(prefixes);
            const suffix = RND.item([
              "Trading Company",
              "Traders",
              "Navigation Company",
              "Trade Company",
              "Trade and Navigation Company"
            ]);
            return prefix + " " + suffix;
          }
        },
        {
          name: "geographic",
          randomName: function() {
            const direction = RND.item(["North", "West", "South", "East"]);
            const feature = RND.item(["Wind", "Sea", "Mountain", "Ocean"]);
            const suffix = RND.item([
              "Trading Company",
              "Traders",
              "Navigation Company",
              "Trade Company",
              "Trade and Navigation Company"
            ]);
            return direction + " " + feature + " " + suffix;
          }
        },
        {
          name: "family",
          randomName: function() {
            const nameGeneratorSet = MUN.getSetByName("fantasy", MUN.allSets());
            if (nameGeneratorSet.family === null) {
              throw new Error("Family name generator not found.");
            }
            const familyNames = nameGeneratorSet.family.generate(100);
            const familyName = RND.item(familyNames);
            const moniker = RND.item([" Brothers", " & Sons", " & Son", " Family", ""]);
            const suffix = RND.item([
              "Trading Company",
              "Traders",
              "Navigation Company",
              "Trade Company",
              "Trade and Navigation Company"
            ]);
            return familyName + " " + moniker + " " + suffix;
          }
        }
      ];
      const namer = RND.item(nameTypes);
      return namer.randomName();
    },
    function() {
      return RND.item([
        "The {name} is noted for the quality of their goods.",
        "The {name} has a reputation for always delivering goods to their intended destination.",
        "The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.",
        "The {name} often openly uses bullying and strong-arming in their dealings.",
        "The {name} deals in a wide variety of goods."
      ]);
    },
    function() {
      let charGenConfig = getFantasy();
      charGenConfig.ageCategoryNames = ["adult"];
      const leader = generate$1(charGenConfig);
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);
      return leader;
    },
    function() {
      const owner = new Rank(
        {
          femaleTitle: "Proprietor",
          maleTitle: "Proprietor",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 0
        },
        "commercial",
        ["adult"]
      );
      const manager = new Rank(
        {
          femaleTitle: "Manager",
          maleTitle: "Manager",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 1
        },
        "commercial",
        ["adult"]
      );
      const employee = new Rank(
        {
          femaleTitle: "Employee",
          maleTitle: "Employee",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 2
        },
        "commercial",
        ["adult"]
      );
      manager.addInferior(employee);
      owner.addInferior(manager);
      return owner;
    },
    config
  );
  return company;
}
function generateType() {
  let config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = matchingAnyTags(["book", "magic", "monster"], all$3());
  let school = new OrganizationType(
    "wizard school",
    100,
    600,
    "headmaster",
    function() {
      const schoolType = RND.item(["School", "Academy", "College"]);
      const suffixTypes = [
        {
          generate: function() {
            return RND.item(["Witchcraft", "Wizardry", "Sorcery", "Mysticism"]);
          }
        },
        {
          generate: function() {
            const first = ["Arcane", "Mystical", "Eldritch", "Occult"];
            const second = ["Arts", "Sciences", "Paths", "Ways", "Secrets"];
            return RND.item(first) + " " + RND.item(second);
          }
        }
      ];
      const suffixType = RND.item(suffixTypes);
      return "The " + schoolType + " of " + suffixType.generate();
    },
    function() {
      return RND.item([
        "{name} is a hidden wizard school that avoids contact with the outside world.",
        "{name} is a proud institution whose students primarily come from the nobility.",
        "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
        "{name} is an egalitarian wizard school that accepts new students from every walk of life."
      ]);
    },
    function() {
      let charGenConfig = getFantasy();
      charGenConfig.ageCategoryNames = ["elderly"];
      const leader = generate$1(charGenConfig);
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
          precedence: 0
        },
        "arcane",
        ["elderly"]
      );
      const professor = new Rank(
        {
          femaleTitle: "Professor",
          maleTitle: "Professor",
          femaleHonorific: "Professor",
          maleHonorific: "Professor",
          hasLands: false,
          landName: "",
          precedence: 1
        },
        "arcane",
        ["adult", "elderly"]
      );
      const student = new Rank(
        {
          femaleTitle: "Student",
          maleTitle: "Student",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 2
        },
        "arcane",
        ["teenager", "young adult"]
      );
      professor.addInferior(student);
      headmaster.addInferior(professor);
      return headmaster;
    },
    config
  );
  return school;
}
class Organization {
  name;
  organizationType;
  description;
  memberCount;
  leadership;
  notableMembers;
  ranks;
  heraldry;
  constructor(name, orgType, description, memberCount, leadership, ranks) {
    this.name = name;
    this.organizationType = orgType;
    this.description = description;
    this.memberCount = memberCount;
    this.leadership = leadership;
    this.notableMembers = [];
    this.ranks = ranks;
  }
  getRanksOfTier(tier) {
    const ranks = [];
    const currentRank = this.ranks;
    if (tier === 0) {
      return [currentRank];
    }
    let ranksToCheck = currentRank.inferiors;
    for (let i = 0; i < tier; i++) {
      let nextRanks = [];
      for (let j = 0; j < ranksToCheck.length; j++) {
        if (ranksToCheck[j].title.precedence === tier) {
          ranks.push(ranksToCheck[j]);
        }
        nextRanks = nextRanks.concat(ranksToCheck[j].inferiors);
      }
      ranksToCheck = nextRanks;
    }
    return ranks;
  }
}
function generate() {
  const orgType = randomType();
  const memberCount = random.int(orgType.minSize, orgType.maxSize);
  const org = new Organization(
    orgType.randomName(),
    orgType,
    orgType.randomDescription(),
    memberCount,
    orgType.randomLeadership(),
    orgType.getRanks()
  );
  org.description = org.description.replace("{name}", org.name);
  org.description += " It has " + org.memberCount + " members. ";
  org.description += randomPopularity();
  org.notableMembers = randomNotableMembers(org);
  org.leadership.description = "They are led by " + getHonorific(org.leadership) + " " + org.leadership.firstName + " " + org.leadership.lastName + ". " + org.leadership.description;
  return org;
}
function randomNotableMembers(org) {
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
        let memberRank = RND.item(possibleRanks);
        let charGenConfig = getFantasy();
        charGenConfig.ageCategoryNames = memberRank.ageGroupNames;
        let member = generate$1(charGenConfig);
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
    "The locals actively hate them."
  ]);
}
function allTypes() {
  const mercCompany = generateType$2();
  const tradingCompany = generateType$1();
  const wizardSchool = generateType();
  return [mercCompany, tradingCompany, wizardSchool];
}
function randomType() {
  return RND.item(allTypes());
}

export { generate as g };
//# sourceMappingURL=fantasy-eced9247.js.map
