"use strict";

import * as RND from "@ironarachne/rng";
import Relationship from "./relationship.js";

export default class RelationshipGenerator {
  strength: number;

  constructor(strength: number) {
    this.strength = strength;
  }

  generate(): Relationship {
    let verb = "";
    let noun = "";

    if (this.strength == -1) {
      verb = RND.item(["dislikes", "distrusts", "mistrusts", "is annoyed by"]);
      noun = "enemy";
    } else if (this.strength == -2) {
      verb = RND.item(["fears", "hates", "loathes", "can't stand"]);
      noun = "enemy";
    } else if (this.strength == 0) {
      verb = RND.item([
        "is intrigued by",
        "is ambivalent towards",
        "is neutral towards",
        "is suspicious of",
      ]);
      noun = "acquaintance";
    } else if (this.strength == 1) {
      verb = RND.item(["likes", "is amused by", "enjoys the company of", "enjoys", "trusts"]);
      noun = "friend";
    } else {
      verb = RND.item(["loves", "deeply trusts", "adores"]);
      noun = "friend";
    }

    return new Relationship(noun, verb, 0, this.strength);
  }
}
