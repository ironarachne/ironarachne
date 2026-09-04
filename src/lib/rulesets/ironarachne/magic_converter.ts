import type { Spell } from './magic_types';

export interface MagicSystemConverter<T> {
  toCommon(spell: T): Spell;
  fromCommon(spell: Spell): T;
}
