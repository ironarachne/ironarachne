import type Title from "$lib/characters/titles/title";

export default interface OrganizationRank {
  name: string;
  tier: number;
  title: Title;
  children: number[];
  parent: number | null;
}
