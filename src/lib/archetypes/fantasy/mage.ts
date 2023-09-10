import * as ItemGenerators from "../../equipment/generators.js";
import type Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    {
      name: "apprentice mage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1,
        },
      ],
      tags: ["magic user"],
      threatLevel: 1,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 1), ItemGenerators.getItemGenerator("robe", 0)],
    },
    {
      name: "archmage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 8,
        },
      ],
      tags: ["magic user"],
      threatLevel: 4,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 3), ItemGenerators.getItemGenerator("robe", 3)],
    },
    {
      name: "druid",
      abilities: [
        {
          name: "nature spellcasting",
          description: "casts nature spells",
          category: "spellcaster",
          threatLevel: 1,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 1), ItemGenerators.getItemGenerator("robe", 0)],
    },
    {
      name: "mage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 4,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 1), ItemGenerators.getItemGenerator("robe", 0)],
    },
    {
      name: "necromancer",
      abilities: [
        {
          name: "necromantic spellcasting",
          description: "casts necromantic spells",
          category: "spellcaster",
          threatLevel: 2,
        },
      ],
      tags: ["magic user"],
      threatLevel: 4,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 3), ItemGenerators.getItemGenerator("robe", 3)],
    },
    {
      name: "sorcerer",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [],
    },
    {
      name: "warlock",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "spellcaster",
          threatLevel: 1,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [],
    },
    {
      name: "witch",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [],
    },
    {
      name: "wizard",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 4,
        },
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [ItemGenerators.getItemGenerator("staff", 1), ItemGenerators.getItemGenerator("robe", 1)],
    },
  ];
}
