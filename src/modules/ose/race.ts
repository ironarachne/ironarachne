'use strict';

import OSEAttributeRequirement from './attributerequirement';
import OSECharacter from './character';
import ClassRestriction from './classrestriction';

export default class OSERace {
  name: string;
  requirements: OSEAttributeRequirement[];
  apply: (character: OSECharacter) => void;
  classRestrictions: ClassRestriction[];

  constructor() {
    this.name = '';
    this.requirements = [];
    this.apply = () => {};
    this.classRestrictions = [];
  }
}
