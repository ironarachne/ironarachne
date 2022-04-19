'use strict';

import LanguageFamilyMember from "./familymember";

export default class LanguageFamily {
  name: string;
  members: LanguageFamilyMember[];

  constructor() {
    this.members = [];
  }
}
