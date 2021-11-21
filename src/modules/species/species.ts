"use strict";

import Gender from "../gender";
import SpeciesAppearanceTrait from "./appearancetrait";

export default class Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  traits: SpeciesAppearanceTrait[];
  genders: Gender[];
  constructor(name: string, pluralName: string, adjective: string, commonality: number, traits: SpeciesAppearanceTrait[], genders: Gender[]) {
    this.name = name;
    this.pluralName = pluralName;
    this.adjective = adjective;
    this.commonality = commonality;
    this.traits = traits;
    this.genders = genders;
  }
}
