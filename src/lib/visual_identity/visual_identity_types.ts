import type { Arms } from '$lib/heraldry/arms.js';
import type { MerchantMark } from '$lib/merchant_marks/merchant_mark_types.js';

/**
 * Display colors for an entity (houses, guilds, schools). Values are typically
 * CSS hex strings (e.g. `#2a4b8c`) to match common string color usage elsewhere in the app.
 */
export type VisualColorPalette = {
  primary: string;
  secondary?: string;
  accent?: string;
};

/**
 * How the entity is represented graphically. Extend with new `kind` variants
 * (mon, flag, badge, …) when you have data and renderers; callers should switch on `kind`.
 */
export type VisualEmblem =
  | { kind: 'none' }
  | { kind: 'heraldry'; arms: Arms }
  | { kind: 'merchant_mark'; mark: MerchantMark };

/**
 * Visual identity for a noble house, company, wizard school, realm, etc.
 * Heraldry is optional and lives only on the `heraldry` emblem variant.
 */
export type VisualIdentity = {
  emblem: VisualEmblem;
  colors?: VisualColorPalette;
  motto?: string;
};
