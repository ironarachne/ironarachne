'use strict';

import NameGenerator from '../../names/generator';
import FamilyMember from './familymember';

export default class Family {
  name: string;
  members: FamilyMember[];
  familyNameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;

  constructor() {
    this.name = '';
    this.members = [];
  }

  getChildren(parent: FamilyMember): FamilyMember[] {
    let children = [];
    for (let i = 0; i < parent.children.length; i++) {
      children.push(this.members[parent.children[i]]);
    }

    return children;
  }

  getMate(person: FamilyMember): FamilyMember {
    return this.members[person.mate];
  }

  getParents(person: FamilyMember): FamilyMember[] {
    let parents = [];
    for (let i = 0; i < person.parents.length; i++) {
      parents.push(this.members[person.parents[i]]);
    }

    return parents;
  }
}
