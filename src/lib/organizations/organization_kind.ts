import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { Arms } from '$lib/heraldry/arms.js';
import type { HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { RNG } from '@ironarachne/rng';
import type { VisualIdentity } from '$lib/visual_identity/visual_identity_types.js';
import type { OrganizationNamingProfile } from './organization_naming.js';
import type { OrganizationHierarchy, OrganizationGenre } from './organization_types.js';
import type { MemberMutator } from './member_mutations.js';

/**
 * Optional materialized arms for consumers that need to re-render without calling
 * `generateHeraldry` again; `buildVisualIdentity` may set emblem to none and
 * store arms here when the pipeline materializes from `heraldryConfig`.
 */
export type OrganizationKindDefinition = {
  id: string;
  genre: OrganizationGenre;
  /** Human-readable label, e.g. "Mercenary company". */
  typeLabel: string;
  namingProfile: OrganizationNamingProfile;
  defaultSizeRange: { min: number; max: number };
  /**
   * Static structure; same for every instance of this kind.
   */
  hierarchy: OrganizationHierarchy;
  /** Role id → mutator applied after `Characters.generate`. */
  mutators: ReadonlyMap<string, MemberMutator>;
  /**
   * Heraldry generation config for this kind; used to materialize `VisualIdentity`.
   */
  heraldryConfig: HeraldryGeneratorConfig;
  /**
   * Optional colors and motto layered on top of emblem in `generateOrganization`.
   */
  buildVisualExtras?: (rng: RNG) => Partial<Pick<VisualIdentity, 'colors' | 'motto' | 'emblem'>> | undefined;
  generateName: (rng: RNG, ctx: { characterConfig: CharacterGenerationConfig }) => string;
  generateDescription: (rng: RNG, ctx: { name: string }) => string;
  /**
   * Override base character config for a role before generation (age bands, archetype tags, etc.).
   */
  prepareCharacterConfigForRole: (
    roleId: string,
    base: CharacterGenerationConfig,
  ) => CharacterGenerationConfig;
  /**
   * When set, overrides random heraldry with fixed arms (rare).
   */
  fixedArms?: Arms;
};
