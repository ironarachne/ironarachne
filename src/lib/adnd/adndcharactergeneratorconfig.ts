import ADNDClass from "./adndclass.js";
import ADNDRace from "./adndrace.js";
import * as classes from "./classes/classes.js";
import * as races from "./races/races.js";

export default class ADNDCharacterGeneratorConfig {
  allowedRaces: ADNDRace[];
  allowedClasses: ADNDClass[];

  constructor() {
    this.allowedRaces = races.getAll();
    this.allowedClasses = classes.getAll();
  }
}
