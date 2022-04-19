'use strict';

import Language from "../language";

export default class LanguageFamilyMember {
  id: number;
  language: Language;
  parents: number[];
  children: number[];

  constructor(id: number) {
    this.id = id;
    this.children = [];
    this.parents = [];
  }
}
