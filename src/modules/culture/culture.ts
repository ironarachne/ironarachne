"use strict";

import Religion from "../religion/religion";
import * as Organization from "./organization";
import MusicStyle from "../music/style";
import GeneratorSet from "../names/generatorset";

export default class Culture {
  name: string;
  organization: Organization.Organization;
  generatorSet: GeneratorSet;
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

  constructor(name: string, organization: Organization.Organization, religion: Religion, taboos: string[], greeting: string, eatingTrait: string, designTrait: string, musicStyle: MusicStyle) {
    this.name = name;
    this.organization = organization;
    this.countryNames = [];
    this.maleNames = [];
    this.femaleNames = [];
    this.familyNames = [];
    this.religion = religion;
    this.taboos = taboos;
    this.greeting = greeting;
    this.eatingTrait = eatingTrait;
    this.designTrait = designTrait;
    this.musicStyle = musicStyle;
  }
}
