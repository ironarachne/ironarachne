"use strict";

export default class PantheonClassification {
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
