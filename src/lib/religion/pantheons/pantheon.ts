"use strict";

import type PantheonMember from "./pantheonmember.js";

export default class Pantheon {
  name: string;
  description: string;
  members: PantheonMember[];
  leader: number;

  constructor() {
    this.name = "";
    this.description = "";
    this.members = [];
    this.leader = -1;
  }
}
