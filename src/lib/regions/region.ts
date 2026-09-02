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
  /**
   * The culture that fills this region, or `null` when it has none of its own.
   *
   * Nullable rather than always present, and that is a correction rather than a new feature: the
   * generator only sets this when a caller supplies a culture, and left `{} as Culture` behind
   * otherwise — an empty object claiming to be a `Culture`, which every reader had to guard
   * against by testing a field for `undefined`. `null` says the same thing honestly, and it is the
   * shape `Culture.religion` already uses for the same situation.
   */
  dominantCulture: Culture | null;
  settlements: Settlement[];
  mainRealm: number;
  realms: Realm[];
  authority: Character;
  organizations: Organization[];
  map: RegionMap;
}
