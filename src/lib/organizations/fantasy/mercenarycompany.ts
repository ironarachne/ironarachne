import type Character from "$lib/characters/character.js";
import * as Characters from "$lib/characters/characters.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import * as Charges from "$lib/heraldry/charges.js";
import HeraldryGeneratorConfig from "$lib/heraldry/generatorconfig.js";
import * as RND from "@ironarachne/rng";
import Rank from "../rank.js";
import OrganizationType from "../type.js";

export function generateType(): OrganizationType {
  let config = new HeraldryGeneratorConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(["weapon", "armor", "aggressive"], Charges.all());

  let company = new OrganizationType(
    "mercenary company",
    20,
    80,
    "captain",
    function(): string {
      const prefix = RND.item([
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
      const suffix = RND.item([
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
    function(): string {
      return RND.item([
        "{name} is a vicious mercenary company with a reputation for excessive violence.",
        "{name} is a merc company that prides itself on its professionalism and integrity.",
        "{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.",
      ]);
    },
    function(this: OrganizationType): Character {
      let charGenConfig = PremadeConfigs.getFantasy();
      charGenConfig.ageCategoryNames = ["adult"];

      const leader = Characters.generate(charGenConfig);
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function(): Rank {
      const captain = new Rank(
        {
          femaleTitle: "Captain",
          maleTitle: "Captain",
          femaleHonorific: "Captain",
          maleHonorific: "Captain",
          hasLands: false,
          landName: "",
          precedence: 0,
        },
        "military",
        ["adult"],
      );
      const lieutenant = new Rank(
        {
          femaleTitle: "Lieutenant",
          maleTitle: "Lieutenant",
          femaleHonorific: "Lieutenant",
          maleHonorific: "Lieutenant",
          hasLands: false,
          landName: "",
          precedence: 1,
        },
        "military",
        ["adult"],
      );
      const sergeant = new Rank(
        {
          femaleTitle: "Sergeant",
          maleTitle: "Sergeant",
          femaleHonorific: "Sergeant",
          maleHonorific: "Sergeant",
          hasLands: false,
          landName: "",
          precedence: 2,
        },
        "military",
        ["adult"],
      );
      const member = new Rank(
        {
          femaleTitle: "Mercenary",
          maleTitle: "Mercenary",
          femaleHonorific: "",
          maleHonorific: "",
          hasLands: false,
          landName: "",
          precedence: 3,
        },
        "military",
        ["adult"],
      );

      sergeant.addInferior(member);
      lieutenant.addInferior(sergeant);
      captain.addInferior(lieutenant);
      return captain;
    },
    config,
  );

  return company;
}
