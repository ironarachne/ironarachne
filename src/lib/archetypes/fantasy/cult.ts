import * as ItemGenerators from "../../equipment/generators.js";
import type Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    {
      name: "cult acolyte",
      abilities: [],
      tags: ["cult"],
      threatLevel: 1,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("staff", 1),
        ItemGenerators.getItemGenerator("robe", 0),
      ],
    },
    {
      name: "cult priest",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "demonic",
          threatLevel: 2,
        },
      ],
      tags: ["cult"],
      threatLevel: 2,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("staff", 1),
        ItemGenerators.getItemGenerator("robe", 1),
      ],
    },
    {
      name: "cult high priest",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "demonic",
          threatLevel: 3,
        },
      ],
      tags: ["cult"],
      threatLevel: 3,
      itemGenerators: [
        ItemGenerators.getItemGeneratorByTag("staff", 3),
        ItemGenerators.getItemGeneratorByTag("knife", 2),
        ItemGenerators.getItemGenerator("robe", 3),
      ],
    },
  ];
}
