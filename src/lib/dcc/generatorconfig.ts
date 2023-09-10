import * as MUN from "@ironarachne/made-up-names";

export default class DCCCharacterGeneratorConfig {
  nameGeneratorMale: MUN.Generator;
  nameGeneratorFemale: MUN.Generator;
  nameGeneratorFamily: MUN.Generator;
  allowedOccupations: string[];

  constructor() {
    let genSet = new MUN.HumanSet();
    if (genSet.family === null) {
      throw new Error("No family name generator found for humans.");
    }
    if (genSet.female === null) {
      throw new Error("No female name generator found for humans.");
    }
    if (genSet.male === null) {
      throw new Error("No male name generator found for humans.");
    }
    this.nameGeneratorFamily = genSet.family;
    this.nameGeneratorFemale = genSet.female;
    this.nameGeneratorMale = genSet.male;
    this.allowedOccupations = ["dwarf", "elf", "halfling", "human"];
  }
}
