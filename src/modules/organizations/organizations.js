import * as iarnd from "../random.js";
import * as CommonNames from "../names/common.js";

export function generate() {
  let organization = {
    name: "",
    description: "",
  };

  let orgType = randomType();

  organization.name = orgType.randomName();
  organization.description = orgType.randomDescription();
  organization.description = organization.description.replace(
    "{name}",
    organization.name
  );

  return organization;
}

function randomType() {
  return iarnd.item([
    {
      name: "mercenary company",
      minSize: 10,
      maxSize: 50,
      leaderTitle: "captain",
      randomName: function () {
        let prefix = iarnd.item([
          "Black",
          "Blood",
          "Burning",
          "Crimson",
          "Free",
          "Gilded",
          "Golden",
          "Iron",
          "Red",
          "Silver",
          "White",
        ]);
        let suffix = iarnd.item([
          "Axes",
          "Army",
          "Bears",
          "Blades",
          "Coins",
          "Company",
          "Dragons",
          "Giants",
          "Lords",
          "Pikes",
          "Sentinels",
          "Swords",
          "Wolves",
          "Wyverns",
        ]);

        return "The " + prefix + " " + suffix;
      },
      randomDescription: function () {
        return iarnd.item([
          "{name} is a vicious mercenary company with a reputation for excessive violence.",
          "{name} is a merc company that prides itself on its professionalism and integrity.",
          "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
        ]);
      },
    },
    {
      name: "trading company",
      minSize: 20,
      maxSize: 200,
      leaderTitle: "president",
      randomName: function () {
        let nameTypes = [
          {
            name: "generic",
            randomName: function () {
              let prefixes = ["Dynasty", "Gilded", "Luxury"];

              let prefix = iarnd.item(prefixes);

              let suffix = iarnd.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return prefix + " " + suffix;
            },
          },
          {
            name: "geographic",
            randomName: function () {
              let direction = iarnd.item(["North", "West", "South", "East"]);
              let feature = iarnd.item(["Wind", "Sea", "Mountain", "Ocean"]);

              let suffix = iarnd.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return direction + " " + feature + " " + suffix;
            },
          },
          {
            name: "family",
            randomName: function () {
              let familyNames = CommonNames.lastNames();

              let familyName = iarnd.item(familyNames);

              let moniker = iarnd.item([
                " Brothers",
                " & Sons",
                " & Son",
                " Family",
                "",
              ]);

              let suffix = iarnd.item([
                "Trading Company",
                "Traders",
                "Navigation Company",
                "Trade Company",
                "Trade and Navigation Company",
              ]);

              return familyName + " " + moniker + " " + suffix;
            },
          },
        ];

        let namer = iarnd.item(nameTypes);

        return namer.randomName();
      },
      randomDescription: function () {
        return iarnd.item([
          "The {name} is noted for the quality of their goods.",
          "The {name} has a reputation for always delivering goods to their intended destination.",
          "The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.",
          "The {name} often openly uses bullying and strong-arming in their dealings.",
          "The {name} deals in a wide variety of goods.",
        ]);
      },
    },
    {
      name: "wizard school",
      minSize: 100,
      maxSize: 600,
      leaderTitle: "headmaster",
      randomName: function () {
        let schoolType = iarnd.item(["School", "Academy", "College"]);
        let suffix = iarnd.item([
          "Arcane Studies",
          "Mystical Arts",
          "Arcane Arts",
          "Mystical Studies",
          "Wizardry",
          "Witchcraft and Wizardry",
          "Sorcery",
          "Eldritch Sciences",
        ]);

        return "The " + schoolType + " of " + suffix;
      },
      randomDescription: function () {
        return iarnd.item([
          "{name} is a hidden wizard school that avoids contact with the outside world.",
          "{name} is a proud institution whose students primarily come from the nobility.",
          "{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.",
          "{name} is an egalitarian wizard school that accepts new students from every walk of life.",
        ]);
      },
    },
  ]);
}
