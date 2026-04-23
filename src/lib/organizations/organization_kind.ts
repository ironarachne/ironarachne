import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { ChargeGlyph } from '$lib/charges/charge-types.js';
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
   * How `generateOrganization` builds the emblem. Defaults to heraldry.
   * When `merchant_mark`, {@link merchantMarkChargeOptions} is required and
   * `heraldryConfig` / `fixedArms` are ignored.
   * When `disc_emblem`, {@link discEmblemChargeOptions} is required.
   * `pattern_lattice` uses no charge list.
   */
  visualEmblemStyle?: 'heraldry' | 'merchant_mark' | 'pattern_lattice' | 'disc_emblem';
  /**
   * Charge glyphs to pick from when `visualEmblemStyle` is `merchant_mark`.
   */
  merchantMarkChargeOptions?: ChargeGlyph[];
  /**
   * Simple geometric charges when `visualEmblemStyle` is `disc_emblem`.
   */
  discEmblemChargeOptions?: ChargeGlyph[];
  /**
   * Heraldry generation config for this kind; used when `visualEmblemStyle` is heraldry (default).
   */
  heraldryConfig: HeraldryGeneratorConfig;
  /**
   * Optional colors and motto layered on top of emblem in `generateOrganization`.
   */
  buildVisualExtras?: (rng: RNG) => Partial<Pick<VisualIdentity, 'colors' | 'motto' | 'emblem'>> | undefined;
  generateName: (rng: RNG, ctx: { characterConfig: CharacterGenerationConfig }) => string;
  /**
   * Override base character config for a role before generation (age bands, archetype tags, etc.).
   */
  prepareCharacterConfigForRole: (
    roleId: string,
    base: CharacterGenerationConfig,
  ) => CharacterGenerationConfig;
  /**
   * When set, overrides random heraldry with fixed arms (rare). Heraldry style only.
   */
  fixedArms?: Arms;
};
