/**
 * Heraldic charge artwork and metadata without tincture (field paint).
 * Heraldry composes these with a {@link Tincture} from `$lib/heraldry/tinctures`.
 */
export type ChargeGlyph = {
  name: string;
  pluralName: string;
  chargeType: string;
  SVG: string;
  tags: string[];
};
