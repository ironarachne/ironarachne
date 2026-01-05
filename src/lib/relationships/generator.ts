import * as RNG from '@ironarachne/rng';
import Relationship from './relationship.js';

export default class RelationshipGenerator {
  strength: number;

  constructor(strength: number) {
    this.strength = strength;
  }

  generate(): Relationship {
    let verb = '';
    let noun = '';

    if (this.strength == -1) {
      verb = RNG.item(['dislikes', 'distrusts', 'mistrusts', 'is annoyed by']);
      noun = 'enemy';
    } else if (this.strength == -2) {
      verb = RNG.item(['fears', 'hates', 'loathes', "can't stand"]);
      noun = 'enemy';
    } else if (this.strength == 0) {
      verb = RNG.item([
        'is intrigued by',
        'is ambivalent towards',
        'is neutral towards',
        'is suspicious of',
      ]);
      noun = 'acquaintance';
    } else if (this.strength == 1) {
      verb = RNG.item(['likes', 'is amused by', 'enjoys the company of', 'enjoys', 'trusts']);
      noun = 'friend';
    } else {
      verb = RNG.item(['loves', 'deeply trusts', 'adores']);
      noun = 'friend';
    }

    return new Relationship(noun, verb, 0, this.strength);
  }
}
