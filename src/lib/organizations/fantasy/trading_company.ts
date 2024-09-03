import type Character from "$lib/characters/character.js";
import type CharacterGeneratorConfig from "$lib/characters/character_generator_config.js";
import * as Characters from "$lib/characters/characters.js";
import * as Charges from "$lib/heraldry/charges.js";
import HeraldryGeneratorConfig from "$lib/heraldry/generatorconfig.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import type OrganizationRank from "../organization_rank.js";
import type OrganizationType from "../organization_type.js";

export function generateType(): OrganizationType {
  const config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(["coin", "money", "trade"], Charges.all());

  const nameGenerator = (): string => {
    const nameTypes = [
      {
        name: "generic",
        randomName: () => {
          const prefixes = ["Dynasty", "Gilded", "Luxury"];

          const prefix = RND.item(prefixes);

          const suffix = RND.item([
            "Trading Company",
            "Traders",
            "Navigation Company",
            "Trade Company",
            "Trade and Navigation Company",
          ]);

          return `${prefix} ${suffix}`;
        },
      },
      {
        name: "geographic",
        randomName: () => {
          const direction = RND.item(["North", "West", "South", "East"]);
          const feature = RND.item(["Wind", "Sea", "Mountain", "Ocean"]);

          const suffix = RND.item([
            "Trading Company",
            "Traders",
            "Navigation Company",
            "Trade Company",
            "Trade and Navigation Company",
          ]);

          return `${direction} ${feature} ${suffix}`;
        },
      },
      {
        name: "family",
        randomName: () => {
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
            "Trade and Navigation Company",
          ]);

          return `${familyName} ${moniker} ${suffix}`;
        },
      },
    ];

    const namer = RND.item(nameTypes);

    return namer.randomName();
  };

  const descriptionGenerator = (): string => {
    return RND.item([
      "The {name} is noted for the quality of their goods.",
      "The {name} has a reputation for always delivering goods to their intended destination.",
      "The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.",
      "The {name} often openly uses bullying and strong-arming in their dealings.",
      "The {name} deals in a wide variety of goods.",
    ]);
  };

  const leadershipGenerator = (characterGenConfig: CharacterGeneratorConfig): Character => {
    characterGenConfig.ageCategoryNames = ["adult"];

    const leader = Characters.generate(characterGenConfig);
    const ranks = getRanks();
    leader.titles.push(ranks[0].title);

    return leader;
  };

  const randomMemberOfRank = (
    rank: OrganizationRank,
    characterGenConfig: CharacterGeneratorConfig,
  ): Character => {
    characterGenConfig.ageCategoryNames = ["adult"];

    const member = Characters.generate(characterGenConfig);
    member.titles.push(rank.title);
    return member;
  };

  return {
    name: "trading company",
    minSize: 30,
    maxSize: 200,
    leaderTitle: "proprietor",
    randomName: nameGenerator,
    randomDescription: descriptionGenerator,
    randomLeadership: leadershipGenerator,
    randomMemberOfRank: randomMemberOfRank,
    ranks: getRanks(),
    heraldryConfig: config,
  };
}

function getRanks(): OrganizationRank[] {
  const ranks: OrganizationRank[] = [{
    name: "proprietor",
    title: {
      femaleTitle: "Proprietor",
      maleTitle: "Proprietor",
      femaleHonorific: "Mistress",
      maleHonorific: "Master",
      hasLands: false,
      landName: "",
      precedence: 0,
    },
    tier: 0,
    parent: null,
    children: [],
  }, {
    name: "manager",
    title: {
      femaleTitle: "Manager",
      maleTitle: "Manager",
      femaleHonorific: "",
      maleHonorific: "",
      hasLands: false,
      landName: "",
      precedence: 1,
    },
    tier: 1,
    parent: null,
    children: [],
  }, {
    name: "employee",
    title: {
      femaleTitle: "Employee",
      maleTitle: "Employee",
      femaleHonorific: "",
      maleHonorific: "",
      hasLands: false,
      landName: "",
      precedence: 2,
    },
    tier: 2,
    parent: null,
    children: [],
  }];

  ranks[0].children.push(1);
  ranks[1].parent = 0;
  ranks[1].children.push(2);
  ranks[2].parent = 1;

  return ranks;
}
