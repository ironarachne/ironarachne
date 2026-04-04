import type { Spell } from './types';

export interface MagicSystemConverter<T> {
  toCommon(spell: T): Spell;
  fromCommon(spell: Spell): T;
}
