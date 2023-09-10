import * as ItemGenerators from "$lib/equipment/generators.js";
import type Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    {
      name: "cleric",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1,
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 1,
        },
      ],
      tags: ["cleric"],
      threatLevel: 2,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("mace", 1),
        ItemGenerators.getItemGeneratorByTag("breastplate", 1),
      ],
    },
    {
      name: "priest",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1,
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 2,
        },
      ],
      tags: ["cleric"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("staff", 1),
        ItemGenerators.getItemGeneratorByTag("robe", 1),
      ],
    },
    {
      name: "high priest",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1,
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 3,
        },
      ],
      tags: ["cleric"],
      threatLevel: 2,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("staff", 2),
        ItemGenerators.getItemGeneratorByTag("robe", 2),
      ],
    },
  ];
}
