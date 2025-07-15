export type TechnologyLevel = {
  name: string;
  level: number;
  description: string;
  commonality: number;
};

export function getTechnologyLevelByLevel(level: number): TechnologyLevel {
  const technology_levels = getTechnologyLevels();
  const technology_level = technology_levels.find(
    (tech) => tech.level === level,
  );
  if (technology_level) {
    return technology_level;
  }
  throw new Error(`Technology level with level ${level} not found.`);
}

export function getTechnologyLevels(): Array<TechnologyLevel> {
  return [
    {
      name: "Stone Age",
      level: 0,
      description: "Basic tools and fire.",
      commonality: 10,
    },
    {
      name: "Bronze Age",
      level: 1,
      description: "Basic metallurgy and agriculture.",
      commonality: 20,
    },
    {
      name: "Middle Age",
      level: 2,
      description: "Printing press and basic machinery.",
      commonality: 20,
    },
    {
      name: "Early Industrial Age",
      level: 3,
      description: "Early industrialization and mechanization.",
      commonality: 30,
    },
    {
      name: "Industrial Age",
      level: 4,
      description: "Automation and manufacturing.",
      commonality: 40,
    },
    {
      name: "Mechanical Age",
      level: 5,
      description: "Complex machinery and advanced manufacturing.",
      commonality: 40,
    },
    {
      name: "Computer Age",
      level: 6,
      description: "Computers and advanced information technology.",
      commonality: 30,
    },
    {
      name: "Pre-Stellar Age",
      level: 7,
      description: "Space travel to other planets and moons.",
      commonality: 20,
    },
    {
      name: "Stellar Age",
      level: 8,
      description: "Interstellar travel and colonization.",
      commonality: 10,
    },
    {
      name: "Gravitic Age",
      level: 9,
      description: "Manipulation of gravity and space-time.",
      commonality: 2,
    },
    {
      name: "Energy Age",
      level: 10,
      description: "Manipulation of energy and matter on a cosmic scale.",
      commonality: 1,
    },
  ];
}
