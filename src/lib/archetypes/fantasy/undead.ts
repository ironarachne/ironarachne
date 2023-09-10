import type Archetype from "../archetype.js";

export function all(): Archetype[] {
  return [
    {
      name: "lich",
      abilities: [
        {
          name: "necromantic spellcasting",
          description: "casts necromantic spells",
          category: "spellcaster",
          threatLevel: 8,
        },
      ],
      tags: ["undead"],
      threatLevel: 5,
      itemGenerators: [],
    },
    { name: "shambler", abilities: [], tags: ["undead"], threatLevel: 1, itemGenerators: [] },
    { name: "sprinter", abilities: [], tags: ["undead"], threatLevel: 2, itemGenerators: [] },
  ];
}
