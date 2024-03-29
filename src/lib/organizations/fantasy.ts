import * as Characters from "$lib/characters/characters.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import * as RND from "@ironarachne/rng";
import random from "random";
import * as MercCompany from "./fantasy/mercenarycompany.js";
import * as TradingCompany from "./fantasy/tradingcompany.js";
import * as WizardSchool from "./fantasy/wizardschool.js";
import Organization from "./organization.js";
import type OrganizationType from "./type.js";

export function generate() {
  const orgType = randomType();
  const memberCount = random.int(orgType.minSize, orgType.maxSize);

  const org = new Organization(
    orgType.randomName(),
    orgType,
    orgType.randomDescription(),
    memberCount,
    orgType.randomLeadership(),
    orgType.getRanks(),
  );
  org.description = org.description.replace("{name}", org.name);

  org.description += " It has " + org.memberCount + " members. ";
  org.description += randomPopularity();

  org.notableMembers = randomNotableMembers(org);

  org.leadership.description = "They are led by "
    + Characters.getHonorific(org.leadership)
    + " "
    + org.leadership.firstName
    + " "
    + org.leadership.lastName
    + ". "
    + org.leadership.description;

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
        let memberRank = RND.item(possibleRanks);

        let charGenConfig = PremadeConfigs.getFantasy();
        charGenConfig.ageCategoryNames = memberRank.ageGroupNames;

        let member = Characters.generate(charGenConfig);
        member.titles.push(memberRank.title);
        notableMembers.push(member);
      }
    }
  }

  return notableMembers;
}

function randomPopularity(): string {
  return RND.item([
    "They enjoy a surprising amount of local popularity.",
    "They are not terribly popular locally.",
    "They're disliked by the local population.",
    "They're fairly popular locally but relatively unknown in the wider region.",
    "While locals are ambivalent about them, they are fairly popular in the wider region.",
    "The locals actively hate them.",
  ]);
}

function allTypes(): OrganizationType[] {
  const mercCompany = MercCompany.generateType();
  const tradingCompany = TradingCompany.generateType();
  const wizardSchool = WizardSchool.generateType();

  return [mercCompany, tradingCompany, wizardSchool];
}

function randomType(): OrganizationType {
  return RND.item(allTypes());
}
