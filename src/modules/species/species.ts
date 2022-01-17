"use strict";

import Gender from "../gender";
import PhysicalTraitGenerator from "../physicaltraits/generator";

export default interface Species {
  name: string;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
}
