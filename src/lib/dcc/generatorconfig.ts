import * as MUN from "@ironarachne/made-up-names";
import { RNG } from "@ironarachne/rng";

export default class DCCCharacterGeneratorConfig {
  nameGeneratorMale: MUN.NameGenerator;
  nameGeneratorFemale: MUN.NameGenerator;
  nameGeneratorFamily: MUN.NameGenerator;
  allowedOccupations: string[];
  rng: RNG;

  constructor(rng: RNG = new RNG(Date.now().toString())) {
    const familyPatterns = MUN.getCultureNamePatternSet("fantasy").family;
    const femalePatterns = MUN.getCultureNamePatternSet("fantasy").female;
    const malePatterns = MUN.getCultureNamePatternSet("fantasy").male;
    this.nameGeneratorFamily = MUN.getNameGeneratorForPatternSet("family", familyPatterns, rng);
    this.nameGeneratorFemale = MUN.getNameGeneratorForPatternSet("female", femalePatterns, rng);
    this.nameGeneratorMale = MUN.getNameGeneratorForPatternSet("male", malePatterns, rng);
    this.allowedOccupations = ["dwarf", "elf", "halfling", "human"];
    this.rng = rng;
  }
}
