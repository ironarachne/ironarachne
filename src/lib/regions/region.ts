import { type Character } from '$lib/characters/character_types.js';
import { type Culture } from '$lib/culture/culture_types.js';
import type Environment from '$lib/environment/environment.js';
import type Organization from '$lib/organizations/organization.js';
import type Realm from '$lib/realms/realm.js';
import type Settlement from '$lib/settlements/settlement.js';
import type { RegionMap } from '$lib/map/map_graph.js';

export default interface Region {
  name: string;
  environment: Environment;
  description: string;
  dominantCulture: Culture;
  settlements: Settlement[];
  mainRealm: number;
  realms: Realm[];
  authority: Character;
  organizations: Organization[];
  map: RegionMap;
}
