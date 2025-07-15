import * as RND from "@ironarachne/rng";
import random from "random";

export type RegionOfControl = {
  name: string;
  description: string;
  region_type: RegionType;
  population: number; // The population of the region of control
  controlling_civilization: string; // The name of the civilization controlling the region
};

export type RegionType = {
  name: string; // The name of the region type
  description: string; // A description of the region type
  scale: number; // The relative size of the region type (1-10, 1 being a village, 10 being a star system)
  population_capacity: number; // The maximum population this region type can support
  technology_level_requirement: number; // The minimum technology level required to control this region type
  commonality: number;
};

export type RegionOfControlGenerationConfig = {
  region_types: Array<RegionType>; // The possible region types for the region of control
  population_density_range: [number, number]; // The population density of the region of control, 0-1
  controlling_civilization: string; // The name of the civilization controlling the region
  technology_level: number; // The technology level of the civilization controlling the region
};

export function generateRegionOfControl(
  config: RegionOfControlGenerationConfig,
): RegionOfControl {
  const region_types = getRegionTypesForTechnologyLevel(
    config.technology_level,
    config.region_types,
  );
  const region_type = RND.weighted(region_types);
  const population_min =
    region_type.population_capacity * config.population_density_range[0];
  const population_max =
    region_type.population_capacity * config.population_density_range[1];
  const population = random.int(population_min, population_max);

  const region_of_control = {
    name: "",
    description: "",
    region_type: region_type,
    population: population,
    controlling_civilization: config.controlling_civilization,
  };

  return region_of_control;
}

export function getDefaultRegionOfControlGenerationConfig(): RegionOfControlGenerationConfig {
  return {
    region_types: getRegionTypes(),
    population_density_range: [0.5, 0.6],
    controlling_civilization: "",
    technology_level: 0,
  };
}

export function getRegionTypesForTechnologyLevel(
  number: number,
  region_types: Array<RegionType>,
): Array<RegionType> {
  const filtered_region_types = region_types.filter((region) => {
    return region.technology_level_requirement <= number;
  });

  if (filtered_region_types.length === 0) {
    throw new Error(`No region types found for technology level ${number}.`);
  }

  return filtered_region_types;
}

export function getRegionTypeByName(name: string): RegionType {
  const region_types = getRegionTypes();
  const region_type = region_types.find((region) => region.name === name);
  if (region_type) {
    return region_type;
  }

  throw new Error(`Region type with name ${name} not found.`);
}

export function getRegionTypeByScale(scale: number): RegionType {
  const region_types = getRegionTypes();
  const region_type = region_types.find((region) => region.scale === scale);
  if (region_type) {
    return region_type;
  }

  throw new Error(`Region type with scale ${scale} not found.`);
}

export function getRegionTypes(): Array<RegionType> {
  return [
    {
      name: "Settlement",
      description: "A single settlement.",
      scale: 1,
      population_capacity: 1e5,
      technology_level_requirement: 0,
      commonality: 10,
    },
    {
      name: "Small Local Region",
      description: "A small local region.",
      scale: 2,
      population_capacity: 2e5,
      technology_level_requirement: 0,
      commonality: 9,
    },
    {
      name: "Medium Local Region",
      description: "A medium-sized local region.",
      scale: 3,
      population_capacity: 1e6,
      technology_level_requirement: 0,
      commonality: 8,
    },
    {
      name: "Large Local Region",
      description: "A large local region.",
      scale: 4,
      population_capacity: 1e7,
      technology_level_requirement: 0,
      commonality: 7,
    },
    {
      name: "Small Planetary Region",
      description: "A small region of a planet.",
      scale: 5,
      population_capacity: 1e7,
      technology_level_requirement: 1,
      commonality: 6,
    },
    {
      name: "Medium Planetary Region",
      description: "A medium-sized region of a planet.",
      scale: 6,
      population_capacity: 1e8,
      technology_level_requirement: 1,
      commonality: 5,
    },
    {
      name: "Large Planetary Region",
      description: "A large region of a planet.",
      scale: 7,
      population_capacity: 1e9,
      technology_level_requirement: 1,
      commonality: 4,
    },
    {
      name: "Planet",
      description: "An entire planet.",
      scale: 8,
      population_capacity: 5e9,
      technology_level_requirement: 2,
      commonality: 3,
    },
    {
      name: "Star System",
      description: "A star system.",
      scale: 9,
      population_capacity: 5e11,
      technology_level_requirement: 3,
      commonality: 2,
    },
    {
      name: "Star System Cluster",
      description: "Multiple star systems adjacent to each other.",
      scale: 10,
      population_capacity: 5e12,
      technology_level_requirement: 4,
      commonality: 1,
    },
  ];
}
