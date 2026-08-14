import { type Character } from '$lib/characters';
import { type Culture } from '$lib/culture';
import type { Environment } from '$lib/environment';
import type { Organization } from '$lib/organizations';
import type { Realm } from '$lib/realms';
import type { Settlement } from '$lib/settlements';
import type { RegionMap } from '$lib/map';

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
