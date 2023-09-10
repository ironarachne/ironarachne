import type Character from "../character.js";

export default interface FamilyMember {
  id: number;
  character: Character;
  children: number[];
  parents: number[];
  mate: number;
}
