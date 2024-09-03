import type Character from "$lib/characters/character.js";
import type CharacterGeneratorConfig from "$lib/characters/character_generator_config.js";
import * as Characters from "$lib/characters/characters.js";
import * as Charges from "$lib/heraldry/charges.js";
import HeraldryGeneratorConfig from "$lib/heraldry/generatorconfig.js";
import * as RND from "@ironarachne/rng";
import type OrganizationRank from "../organization_rank.js";
import type OrganizationType from "../organization_type.js";

export function generateType(): OrganizationType {
  const config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(["weapon", "armor", "aggressive"], Charges.all());

  const nameGenerator = (): string => {
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

    return `The ${prefix} ${suffix}`;
  };

  const descriptionGenerator = (): string =>
    RND.item([
      "{name} is a vicious mercenary company with a reputation for excessive violence.",
      "{name} is a merc company that prides itself on its professionalism and integrity.",
      "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
    ]);

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
    name: "mercenary company",
    minSize: 20,
    maxSize: 80,
    leaderTitle: "captain",
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
    name: "captain",
    title: {
      femaleTitle: "Captain",
      maleTitle: "Captain",
      femaleHonorific: "Captain",
      maleHonorific: "Captain",
      hasLands: false,
      landName: "",
      precedence: 0,
    },
    tier: 0,
    parent: null,
    children: [],
  }, {
    name: "lieutenant",
    title: {
      femaleTitle: "Lieutenant",
      maleTitle: "Lieutenant",
      femaleHonorific: "Lieutenant",
      maleHonorific: "Lieutenant",
      hasLands: false,
      landName: "",
      precedence: 1,
    },
    tier: 1,
    parent: null,
    children: [],
  }, {
    name: "sergeant",
    title: {
      femaleTitle: "Sergeant",
      maleTitle: "Sergeant",
      femaleHonorific: "Sergeant",
      maleHonorific: "Sergeant",
      hasLands: false,
      landName: "",
      precedence: 2,
    },
    tier: 2,
    parent: null,
    children: [],
  }, {
    name: "member",
    title: {
      femaleTitle: "Mercenary",
      maleTitle: "Mercenary",
      femaleHonorific: "",
      maleHonorific: "",
      hasLands: false,
      landName: "",
      precedence: 3,
    },
    tier: 3,
    parent: null,
    children: [],
  }];

  ranks[0].children.push(1);
  ranks[1].parent = 0;
  ranks[1].children.push(2);
  ranks[2].parent = 1;
  ranks[2].children.push(3);
  ranks[3].parent = 2;

  return ranks;
}
