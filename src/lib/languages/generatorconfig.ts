import PhonemeSet from "./phonemeset.js";
import * as PhonemeSets from "./phonemesets.js";

export default class LanguageGeneratorConfig {
  phonemeSets: PhonemeSet[];

  constructor() {
    this.phonemeSets = PhonemeSets.all();
  }
}
