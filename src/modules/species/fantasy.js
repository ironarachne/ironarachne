export function all() {
  return [
    {
      name: "human",
      pluralName: "humans",
      adjective: "human",
      commonality: 100,
      ageGroups: [
        {
          name: "infant",
          minAge: 0,
          maxAge: 1,
          femaleHeight: "1d20+50",
          maleHeight: "1d20+50",
          femaleWeight: "1d4+6",
          maleWeight: "1d4+7",
        },
        {
          name: "child",
          minAge: 2,
          maxAge: 12,
          femaleHeight: "4d10+100",
          maleHeight: "4d10+100",
          femaleWeight: "1d20+20",
          maleWeight: "1d20+20",
        },
        {
          name: "teenager",
          minAge: 13,
          maxAge: 19,
          femaleHeight: "1d10+152",
          maleHeight: "2d20+147",
          femaleWeight: "1d10+46",
          maleWeight: "1d10+56",
        },
        {
          name: "adult",
          minAge: 20,
          maxAge: 60,
          femaleHeight: "1d20+152",
          maleHeight: "1d20+163",
          femaleWeight: "2d10+46",
          maleWeight: "2d20+70",
        },
        {
          name: "elderly",
          minAge: 60,
          maxAge: 110,
          femaleHeight: "1d20+152",
          maleHeight: "1d20+163",
          femaleWeight: "1d20+46",
          maleWeight: "2d20+70",
        },
      ],
      traits: [
        {
          name: "hair color",
          descriptionTemplate: "{name} hair",
          options: [
            "blonde",
            "dark",
            "black",
            "russet",
            "light",
            "brown",
            "red",
          ],
        },
        {
          name: "skin color",
          descriptionTemplate: "{name} skin",
          options: [
            "tan",
            "light",
            "bronzed",
            "black",
            "ebony",
            "white",
            "pale",
          ],
        },
        {
          name: "eye color",
          descriptionTemplate: "{name} eyes",
          options: [
            "blue",
            "green",
            "brown",
            "dark",
            "amber",
          ],
        },
      ]
    }
  ];
}
