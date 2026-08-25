import type { RNG } from '@ironarachne/rng';

import type ADNDCharacter from '../adndcharacter.js';
import type ADNDSubrace from '../adndsubrace.js';

/**
 * The three halfling varieties, and the only subraces on the site so far.
 *
 * Each rolls its own infravision — Stouts at 15%, the other two at 25% — which is the reason
 * `ADNDSubrace.apply` is handed an RNG at all. The draw happens inside the variety rather than
 * outside it, so a variety that had no chance of its own would take none.
 *
 * The order in which abilities are pushed matters and is preserved from what
 * `applyHalflingWithOptions` did: the variety's own lines first, then the two every halfling has,
 * which the race pushes afterwards. A character sheet is a list, and reordering it would be a
 * visible change for no reason.
 */
function infravisionChance(chance: number, description: string): ADNDSubrace['apply'] {
  return (character: ADNDCharacter, rng: RNG) => {
    if (rng.simple(100) <= chance) {
      character.abilities.push(description);
    }
    return character;
  };
}

const hairfeet: ADNDSubrace = {
  name: 'Hairfeet',
  apply: infravisionChance(25, "Limited Infravision (30')"),
};

const tallfellow: ADNDSubrace = {
  name: 'Tallfellow',
  apply: infravisionChance(25, "Limited Infravision (30')"),
};

const stout: ADNDSubrace = {
  name: 'Stout',
  apply: (character: ADNDCharacter, rng: RNG) => {
    if (rng.simple(100) <= 15) {
      character.abilities.push("Normal Infravision (60')");
    }
    character.abilities.push('Know if a passage has up or down grade on 1,2,3 on 1d4');
    character.abilities.push('Determine direction on 1,2,3 on 1d6');
    return character;
  },
};

/** In the order the generator draws from, which is the order they were drawn from before. */
export const halflingSubraces: ADNDSubrace[] = [hairfeet, tallfellow, stout];
