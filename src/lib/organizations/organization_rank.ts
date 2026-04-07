import { type Title } from '$lib/characters/character_types';

export default interface OrganizationRank {
  name: string;
  tier: number;
  title: Title;
  children: number[];
  parent: number | null;
}
