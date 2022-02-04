'use strict';

export default class ReligionCategory {
  name: string;
  description: string;
  hasDeities: boolean;
  hasLeader: boolean;
  minDeities: number;
  maxDeities: number;

  constructor() {
    this.name = '';
    this.description = '';
    this.hasDeities = false;
    this.hasLeader = false;
    this.minDeities = 0;
    this.maxDeities = 0;
  }
}
