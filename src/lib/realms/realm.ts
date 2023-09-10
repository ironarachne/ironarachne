import type Character from "$lib/characters/character.js";
import type Title from "$lib/characters/titles/title.js";
import type Vertex from "$lib/geometry/vertex.js";
import type Arms from "$lib/heraldry/arms.js";
import type Claim from "./claim.js";
import type RealmType from "./realm_type.js";

export default interface Realm {
  name: string;
  adjective: string;
  description: string;
  heraldry: Arms; // TODO: use an abstract representation of imagery, so we can optionally do mon or flags instead of heraldry
  authority: Character;
  grantedTitle: Title;
  tiles: Vertex[];
  claims: Claim[];
  parent: number; // array index of the parent realm
  realmType: RealmType;
}
