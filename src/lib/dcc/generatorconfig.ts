import * as MUN from "@ironarachne/made-up-names";

export default class DCCCharacterGeneratorConfig {
  nameGeneratorMale: MUN.Generator;
  nameGeneratorFemale: MUN.Generator;
  nameGeneratorFamily: MUN.Generator;
  allowedOccupations: string[];

  constructor() {
    let genSet = MUN.getSetByName("human", MUN.fantasyRaceSets());
    this.nameGeneratorFamily = genSet.family;
    this.nameGeneratorFemale = genSet.female;
    this.nameGeneratorMale = genSet.male;
    this.allowedOccupations = ["dwarf", "elf", "halfling", "human"];
  }
}
