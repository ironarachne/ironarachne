import * as Environments from "$lib/environment/environments.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Dice from "../dice.js";
import type Settlement from "./settlement.js";
import * as Categories from "./settlement_categories.js";
import type SettlementGeneratorConfig from "./settlement_generator_config.js";

export function generate(config: SettlementGeneratorConfig): Settlement {
  const settlementName = (config.nameGenerator !== null)
    ? config.nameGenerator.generate(1)[0]
    : "Settlement";
  const settlementCategory = RND.item(Categories.bySizeClass(config.size));
  const settlement: Settlement = {
    name: settlementName,
    category: settlementCategory,
    environment: config.environment,
    description: "",
    population: Categories.randomPopulation(settlementCategory),
    prosperity: Dice.roll("2d6"),
  };

  settlement.description = randomDescription(settlement);

  return settlement;
}

export function getDefaultConfig(): SettlementGeneratorConfig {
  let environment = Environments.generate();

  let genSet = MUN.getSetByName("fantasy", MUN.cultureSets());

  let nameGenerator = genSet.town;
  let size = "any";

  return {
    environment,
    nameGenerator,
    size,
  };
}

function randomDescription(settlement: Settlement): string {
  let description = RND.item([
    "{name} is a {category} of {population} people.",
    "The {category} of {name} has {population} people.",
  ]);

  description = description.replace("{category}", settlement.category.name);
  description = description.replace(
    "{population}",
    new Intl.NumberFormat().format(settlement.population),
  );
  description = description.replace("{name}", settlement.name);
  description += " " + Categories.randomDescription(settlement.category);
  description += " " + randomProsperity(settlement.prosperity);
  description += " " + randomReputation();
  description += " " + RND.item(settlement.environment.biome.features);

  return description;
}

function randomProsperity(prosperity: number): string {
  let prefixes = [
    "The people here",
    "Most people here",
    "Folks here",
    "Most folks here",
    "People here",
  ];

  let suffixes = [];

  if (prosperity < 4) {
    suffixes = [
      "have little more than what they need to survive",
      "struggle to make ends meet",
      "struggle to have enough to survive",
    ];
  } else if (prosperity < 8) {
    suffixes = [
      "have enough to meet their needs",
      "have just enough to meet their needs",
      "seem to be doing well",
      "have their needs met",
    ];
  } else {
    suffixes = ["have more wealth than most", "are prosperous", "have more than they need"];
  }

  let options = [];

  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      options.push(`${prefixes[i]} ${suffixes[j]}.`);
    }
  }

  return RND.item(options);
}

function randomReputation(): string {
  let prefixes = [
    "The people are known for",
    "The people are regarded as",
    "Folk here have a reputation for",
    "People here are regarded as",
    "The folk here are known for",
    "They are known for",
    "They are well known for",
    "They are sometimes known for",
    "Some other places regard the people here as",
    "Some places regard the people here as",
    "Some places regard them as",
    "Some regard them as",
    "Some folks regard them as",
  ];

  let suffixes = [
    "being aloof",
    "being suspicious of others",
    "being suspicious of outsiders",
    "being friendly and open",
    "being friendly but devious",
    "being friendly",
    "being greedy",
    "being altruistic",
    "being trusting",
    "being mistrustful",
    "being miserly",
    "being obsessed with status",
    "being hardworking",
    "being devious",
    "being unfriendly",
    "being trustworthy",
    "being lazy",
    "spending too much time making merry",
    "spending too much time slacking off",
    "working hard",
    "working too hard",
    "being unruly",
    "being belligerent",
  ];

  let reputations: string[] = [];

  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      reputations.push(`${prefixes[i]} ${suffixes[j]}.`);
    }
  }

  return RND.item(reputations);
}
