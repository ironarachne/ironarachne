import random from "random";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import { clamp } from "$lib/math_translation";

export type Civilization = {
  name: string;
  description: string;
  population: number;
  technology_level: number;
  government_type: GovernmentType;
  economy_type: EconomyType;
  military: Military;
};

export type CivilizationGenerationConfig = {
  population_range: [number, number];
  technology_level_range: [number, number];
  military_strength_range: [number, number];
};

export type EconomyType = {
  name: string;
  adjective: string;
  description: string;
  commonality: number;
}

export type GovernmentType = {
  name: string;
  adjective: string;
  description: string;
  name_options: string[];
  commonality: number;
}

export type Military = {
  quality: number; // 1-10, 1 being a militia, 10 being a highly trained and equipped army (Spartans! What is your profession?)
  size: number; // 0-1, a percentage of the population
  equipment_level: number; // 1-10, 1 being basic weapons, 10 being advanced specialized gear for the tech level
  training_level: number; // 1-10, 1 being minimal training, 10 being highly trained
}

export function describeMilitary(military: Military): string {
  const quality_descriptions = [
    "terrible",
    "poor",
    "understrength",
    "moderate",
    "good",
    "strong",
    "powerful",
    "elite",
    "terrifying",
    "unstoppable"
  ];
  const military_quality = quality_descriptions[military.quality - 1];
  const military_size = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(military.size);
  return `${Words.article(military_quality)} ${military_quality} military with a size of ${military_size} of the population, an equipment level of ${military.equipment_level}, and a training level of ${military.training_level}`;
}

export function generateCivilization(
  config: CivilizationGenerationConfig,
): Civilization {
  const population = random.int(
    config.population_range[0],
    config.population_range[1],
  );
  const technology_level = random.int(
    config.technology_level_range[0],
    config.technology_level_range[1],
  );
  const military = generateMilitary(
    [0.001, 0.01],
    [config.military_strength_range[0],
    config.military_strength_range[1]],
  );
  const government_types = getGovernmentTypes();
  const government_type = RND.weighted(government_types);

  const economy_types = getEconomyTypes();
  const economy_type = RND.weighted(economy_types);

  const civilization = {
    name: generateCivilizationName(government_type),
    description: "",
    population: population,
    technology_level: technology_level,
    government_type: government_type,
    economy_type: economy_type,
    military: military,
  };

  civilization.description = getCivilizationDescription(civilization);

  return civilization;
}

export function generateMilitary(size_range: [number, number], quality_range: [number, number]): Military {
  const size = random.float(size_range[0], size_range[1]);
  const quality = random.int(quality_range[0], quality_range[1]);
  // Quality is the average of equipment and training level, but neither equipment nor training can be lower than 1 or higher than 10
  const equipment_level = clamp(random.int(1, quality), 1, 10);
  const training_level = clamp(quality * 2 - equipment_level, 1, 10);

  return {
    quality: quality,
    size: size,
    equipment_level: equipment_level,
    training_level: training_level,
  };
}

export function getDefaultCivilizationGenerationConfig(): CivilizationGenerationConfig {
  return {
    population_range: [1000, 1000000000],
    technology_level_range: [1, 10],
    military_strength_range: [1, 10],
  };
}

export function generateCivilizationName(government_type: GovernmentType): string {
  const generator = new MUN.StarNationNameGenerator();
  const name = generator.generate(1)[0];

  const name_template = RND.item(government_type.name_options);

  return name_template.replace("{name}", name);
}

export function getCivilizationDescription(civilization: Civilization): string {
  return `The ${civilization.name} is a ${civilization.government_type.adjective} civilization with a population of ${getFriendlyPopulation(civilization.population)} and a technology level of ${civilization.technology_level}. It has a ${civilization.economy_type.adjective} economy. The military is ${describeMilitary(civilization.military)}.`;
}

export function getFriendlyPopulation(population: number): string {
  if (population < 1000) {
    return `${population}`;
  }

  if (population < 1000000) {
    return `${Math.round(population / 1000)} thousand`;
  }

  if (population < 1000000000) {
    return `${Math.round(population / 1000000)} million`;
  }

  if (population < 1000000000000) {
    return `${Math.round(population / 1000000000)} billion`;
  }

  return `${Math.round(population / 1000000000000)} trillion`;
}

function getEconomyTypes(): EconomyType[] {
  return [
    {
      name: "Capitalist",
      adjective: "capitalist",
      description: "An economic system based on private ownership and the free market.",
      commonality: 10,
    },
    {
      name: "Socialist",
      adjective: "socialist",
      description: "An economic system where the means of production are owned and regulated by the community as a whole.",
      commonality: 3,
    },
    {
      name: "Feudal",
      adjective: "feudal",
      description: "An economic system based on the exchange of land for military service and labor.",
      commonality: 2,
    },
    {
      name: "Barter",
      adjective: "barter",
      description: "An economic system where goods and services are exchanged directly for other goods and services without using money.",
      commonality: 1,
    },
    {
      name: "Mixed",
      adjective: "mixed",
      description: "An economic system that combines elements of capitalism and socialism.",
      commonality: 5,
    },
    {
      name: "Command",
      adjective: "command",
      description: "An economic system where the government makes all economic decisions and controls the means of production.",
      commonality: 2,
    },
    {
      name: "Gift",
      adjective: "gift",
      description: "An economic system where goods and services are given without any expectation of return.",
      commonality: 1,
    },
    {
      name: "Resource-based",
      adjective: "resource-based",
      description: "An economic system where resources are allocated based on availability and need.",
      commonality: 1,
    },
    {
      name: "Subsistence",
      adjective: "subsistence",
      description: "An economic system where people produce just enough to meet their own needs.",
      commonality: 1,
    }
  ];
}

function getGovernmentTypes(): GovernmentType[] {
  return [
    {
      name: "Democracy",
      adjective: "democratic",
      description: "A system of government in which the citizens exercise power directly or elect representatives from among themselves to form a governing body.",
      name_options: ["Democratic Republic of {name}", "Republic of {name}", "{name} Republic"],
      commonality: 5,
    },
    {
      name: "Monarchy",
      adjective: "monarchic",
      description: "A form of government with a monarch at the head.",
      name_options: ["Kingdom of {name}", "{name} Kingdom"],
      commonality: 2,
    },
    {
      name: "Oligarchy",
      adjective: "oligarchic",
      description: "A form of power structure in which power resides in the hands of a small number of people.",
      name_options: ["{name} Confederation", "Confederation of {name}", "{name} Technocracy"],
      commonality: 1,
    },
    {
      name: "Theocracy",
      adjective: "theocratic",
      description: "A system of government in which priests rule in the name of God or a god.",
      name_options: ["Holy Empire of {name}", "Kingdom of {name}", "{name} Kingdom", "Holy Kingdom of {name}"],
      commonality: 2,
    },
    {
      name: "Dictatorship",
      adjective: "dictatorial",
      description: "A form of government in which a single person or party has absolute power.",
      name_options: ["{name} Empire", "Empire of {name}", "{name} Dominion", "Dominion of {name}"],
      commonality: 4,
    },
  ];
}
