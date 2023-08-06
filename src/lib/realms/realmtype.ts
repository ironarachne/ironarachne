"use strict";

import Title from "../characters/title.js";

export default class RealmType {
  name: string;
  minTiles: number;
  maxTiles: number;
  grantedTitle: Title;
  commonality: number;
  isStandalone: boolean;
  parentType: RealmType | null;

  constructor(
    name: string,
    minTiles: number,
    maxTiles: number,
    grantedTitle: Title,
    commonality: number,
    isStandalone: boolean,
    parentType: RealmType | null,
  ) {
    this.name = name;
    this.minTiles = minTiles;
    this.maxTiles = maxTiles;
    this.grantedTitle = grantedTitle;
    this.commonality = commonality;
    this.isStandalone = isStandalone;
    this.parentType = parentType;
  }
}
