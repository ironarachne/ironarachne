import * as ItemGenerators from "../../equipment/generators.js";
import type Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    {
      name: "archer",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [ItemGenerators.getItemGeneratorByTag("bow", 1)],
    },
    {
      name: "captain",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("sword", 2),
        ItemGenerators.getItemGeneratorByTag("breastplate", 2),
        ItemGenerators.getItemGeneratorByTag("helmet", 2),
      ],
    },
    {
      name: "general",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("sword", 3),
        ItemGenerators.getItemGeneratorByTag("breastplate", 3),
        ItemGenerators.getItemGeneratorByTag("helmet", 3),
      ],
    },
    {
      name: "guard",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("spear", 1),
        ItemGenerators.getItemGeneratorByTag("body armor", 1),
      ],
    },
    { name: "hunter", abilities: [], tags: ["martial", "wilderness"], threatLevel: 1, itemGenerators: [] },
    { name: "martial artist", abilities: [], tags: ["martial"], threatLevel: 1, itemGenerators: [] },
    { name: "martial arts master", abilities: [], tags: ["martial"], threatLevel: 2, itemGenerators: [] },
    {
      name: "raider captain",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("sword", 1),
        ItemGenerators.getItemGeneratorByTag("breastplate", 1),
      ],
    },
    {
      name: "raider",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("weapon", 1),
        ItemGenerators.getItemGeneratorByTag("body armor", 1),
      ],
    },
    { name: "ranger", abilities: [], tags: ["martial", "wilderness"], threatLevel: 3, itemGenerators: [] },
    {
      name: "soldier",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("martial weapon", 1),
        ItemGenerators.getItemGeneratorByTag("body armor", 1),
      ],
    },
    {
      name: "thug",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [ItemGenerators.getItemGeneratorByTag("club", 1)],
    },
    {
      name: "veteran hunter",
      abilities: [],
      tags: ["martial", "wilderness"],
      threatLevel: 2,
      itemGenerators: [ItemGenerators.getItemGeneratorByTag("bow", 3)],
    },
    {
      name: "veteran soldier",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 2,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("sword", 2),
        ItemGenerators.getItemGeneratorByTag("breastplate", 2),
      ],
    },
    {
      name: "warrior",
      abilities: [],
      tags: ["martial", "wilderness"],
      threatLevel: 1,
      itemGenerators: [ItemGenerators.getItemGeneratorByTag("simple weapon", 1)],
    },
  ];
}
