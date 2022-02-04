'use strict';

import Rank from './rank';
import Character from '../characters/character';
import * as Heraldry from '../heraldry/heraldry';
import OrganizationType from './type';

export default class Organization {
  name: string;
  organizationType: OrganizationType;
  description: string;
  memberCount: number;
  leadership: Character;
  notableMembers: Character[];
  ranks: Rank;
  heraldry: Heraldry.Heraldry;

  constructor(
    name: string,
    orgType: OrganizationType,
    description: string,
    memberCount: number,
    leadership: Character,
    ranks: Rank,
  ) {
    this.name = name;
    this.organizationType = orgType;
    this.description = description;
    this.memberCount = memberCount;
    this.leadership = leadership;
    this.notableMembers = [];
    this.ranks = ranks;
  }

  getRanksOfTier(tier: number) {
    const ranks = [];
    const currentRank = this.ranks;

    if (tier === 0) {
      return [currentRank];
    }

    let ranksToCheck = currentRank.inferiors;

    for (let i = 0; i < tier; i++) {
      let nextRanks: Rank[] = [];
      for (let j = 0; j < ranksToCheck.length; j++) {
        if (ranksToCheck[j].title.precedence === tier) {
          ranks.push(ranksToCheck[j]);
        }
        nextRanks = nextRanks.concat(ranksToCheck[j].inferiors);
      }
      ranksToCheck = nextRanks;
    }

    return ranks;
  }
}
