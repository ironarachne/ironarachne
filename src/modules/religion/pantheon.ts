"use strict";

import * as RND from "../random";
import {Deity} from "@/modules/religion/deity";

export class Pantheon {
  name: string;
  description: string;
  deities: Deity[];
  classification: Classification;

  constructor(name: string, description: string, classification: Classification) {
    this.name = name;
    this.description = description;
    this.deities = [];
    this.classification = classification;
  }
}

export class Classification {
  name: string;
  hasLeader: boolean;
  leaderGender: string;
  minSize: number;
  maxSize: number;

  constructor(name: string, hasLeader: boolean, leaderGender: string, minSize: number, maxSize: number) {
    this.name = name;
    this.hasLeader = hasLeader;
    this.leaderGender = leaderGender;
    this.minSize = minSize;
    this.maxSize = maxSize;
  }
}

export function randomClassification() {
  let classifications = [
    new Classification(
      "patriarchal autocracy",
      true,
      "male",
      5,
      12,
    ),
    new Classification(
      "matriarchal autocracy",
      true,
      "female",
      5,
      12,
    ),
    new Classification(
      "egalitarian society",
      false,
      "",
      5,
      12,
    ),
    new Classification(
      "monotheistic domain",
      false,
      "",
      1,
      1,
    ),
  ];

  return RND.item(classifications);
}
