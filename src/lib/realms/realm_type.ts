import type Title from "$lib/characters/titles/title.js";

export default interface RealmType {
  name: string;
  minTiles: number;
  maxTiles: number;
  grantedTitle: Title;
  commonality: number;
  isStandalone: boolean;
  parentType: RealmType | null;
}
