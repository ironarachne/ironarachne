import * as MUN from "@ironarachne/made-up-names";
import type MusicStyle from "../music/style.js";
import type Religion from "../religion/religion.js";
import type { Organization } from "./organization.js";

// Culture is understood as the patterns, rules, and meanings of social interaction; these are the foundation of all social order.
export default class Culture {
  name: string;
  organization: Organization;
  generatorSet: MUN.GeneratorSet;
  countryNames: string[];
  familyNames: string[];
  femaleNames: string[];
  maleNames: string[];
  townNames: string[];
  religion: Religion;
  taboos: string[];
  greeting: string;
  eatingTrait: string;
  designTrait: string;
  musicStyle: MusicStyle;

  constructor(
    name: string,
    organization: Organization,
    religion: Religion,
    taboos: string[],
    greeting: string,
    eatingTrait: string,
    designTrait: string,
    musicStyle: MusicStyle,
  ) {
    this.name = name;
    this.organization = organization;
    this.generatorSet = MUN.getSetByName("fantasy", MUN.cultureSets());
    this.countryNames = [];
    this.maleNames = [];
    this.femaleNames = [];
    this.familyNames = [];
    this.townNames = [];
    this.religion = religion;
    this.taboos = taboos;
    this.greeting = greeting;
    this.eatingTrait = eatingTrait;
    this.designTrait = designTrait;
    this.musicStyle = musicStyle;
  }
}
