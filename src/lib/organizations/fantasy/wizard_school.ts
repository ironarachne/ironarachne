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
  config.chargeOptions = Charges.matchingAnyTags(["book", "magic", "monster"], Charges.all());

  const nameGenerator = (): string => {
    const schoolType = RND.item(["School", "Academy", "College", "Institute"]);

    const suffixTypes = [
      {
        generate: (): string => RND.item(["Witchcraft", "Wizardry", "Sorcery", "Mysticism"]),
      },
      {
        generate: (): string => {
          // example names: The School of Hidden Mysteries, The Academy of Unknown Arts
          const modifier = RND.item([
            "Arcane",
            "Cherished",
            "Eldritch",
            "Esoteric",
            "Forbidden",
            "Forgotten",
            "Hidden",
            "Lost",
            "Mystical",
            "Occult",
            "Unknown",
          ]);
          const focus = RND.item([
            "Mysteries",
            "Arts",
            "Sciences",
            "Paths",
            "Ways",
            "Secrets",
            "Knowledge",
            "Wisdom",
            "Power",
            "Magic",
            "Enchantment",
            "Illusion",
            "Divination",
            "Conjuration",
            "Abjuration",
            "Evocation",
            "Necromancy",
            "Transmutation",
          ]);

          return `${modifier} ${focus}`;
        },
      },
      {
        generate: (): string => {
          const first = ["Arcane", "Mystical", "Eldritch", "Occult"];

          const second = ["Arts", "Sciences", "Paths", "Ways", "Secrets"];

          return `${RND.item(first)} ${RND.item(second)}`;
        },
      },
    ];

    const suffixType = RND.item(suffixTypes);

    return `The ${schoolType} of ${suffixType.generate()}`;
  };

  const descriptionGenerator = (): string => {
    return RND.item([
      "{name} is a hidden wizard school that avoids contact with the outside world.",
      "{name} is a proud institution whose students primarily come from the nobility.",
      "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
      "{name} is an egalitarian wizard school that accepts new students from every walk of life.",
    ]);
  };

  const leadershipGenerator = (characterGenConfig: CharacterGeneratorConfig): Character => {
    characterGenConfig.ageCategoryNames = ["adult", "elderly"];

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

    if (rank.name === "headmaster" || rank.name === "professor") {
      characterGenConfig.ageCategoryNames = ["adult", "elderly"];
    } else if (rank.name === "student") {
      characterGenConfig.ageCategoryNames = ["child", "teen"];
    }

    const member = Characters.generate(characterGenConfig);
    member.titles.push(rank.title);
    return member;
  };

  return {
    name: "wizard school",
    minSize: 50,
    maxSize: 600,
    leaderTitle: "headmaster",
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
    name: "headmaster",
    title: {
      femaleTitle: "Headmaster",
      maleTitle: "Headmaster",
      femaleHonorific: "Headmaster",
      maleHonorific: "Headmaster",
      hasLands: false,
      landName: "",
      precedence: 0,
    },
    tier: 0,
    parent: null,
    children: [],
  }, {
    name: "professor",
    title: {
      femaleTitle: "Professor",
      maleTitle: "Professor",
      femaleHonorific: "Professor",
      maleHonorific: "Professor",
      hasLands: false,
      landName: "",
      precedence: 1,
    },
    tier: 1,
    parent: null,
    children: [],
  }, {
    name: "student",
    title: {
      femaleTitle: "Student",
      maleTitle: "Student",
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
