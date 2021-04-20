import * as Species from "./common.js"

export function all() {
  return [
    new Species.Species(
      "dwarf",
      "dwarves",
      "dwarven",
      20,
      400,
      0.8,
      1.1,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "dark",
            "black",
            "russet",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "bronzed",
            "ruddy",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
    new Species.Species(
      "elf",
      "elves",
      "elven",
      30,
      700,
      0.9,
      0.6,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "light",
            "bronzed",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
            "grey",
          ],
        ),
      ]
    ),
    new Species.Species(
      "gnome",
      "gnomes",
      "gnome",
      20,
      500,
      0.6,
      0.4,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "light",
            "bronzed",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
    new Species.Species(
      "halfling",
      "halflings",
      "halfling",
      40,
      200,
      0.5,
      0.3,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "light",
            "bronzed",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
    new Species.Species(
      "half-elf",
      "half-elves",
      "half-elf",
      15,
      185,
      0.95,
      0.9,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "light",
            "bronzed",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
    new Species.Species(
      "half-orc",
      "half-orcs",
      "half-orc",
      10,
      80,
      0.95,
      0.95,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "grey",
            "green",
            "olive",
            "tan",
            "light",
            "bronzed",
            "black",
            "ebony",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
    new Species.Species(
      "human",
      "humans",
      "human",
      200,
      100,
      1,
      1,
      [
        new Species.AppearanceTrait(
          "hair color",
          "{name} hair",
          [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        ),
        new Species.AppearanceTrait(
          "skin color",
          "{name} skin",
          [
            "tan",
            "light",
            "bronzed",
            "black",
            "ebony",
            "white",
            "pale",
          ],
        ),
        new Species.AppearanceTrait(
          "eye color",
          "{name} eyes",
          [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        ),
      ]
    ),
  ];
}
