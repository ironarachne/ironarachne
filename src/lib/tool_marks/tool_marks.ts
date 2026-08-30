import chest from '$lib/assets/icons/set2/chest.svg?raw';
import compass from '$lib/assets/icons/set2/compass.svg?raw';
import flag from '$lib/assets/icons/set2/flag.svg?raw';
import helmet from '$lib/assets/icons/set2/helmet-1.svg?raw';
import map from '$lib/assets/icons/set2/map.svg?raw';
import { DOMAINS, type ToolDomain } from '$lib/tools';

/**
 * The mark each tool domain wears.
 *
 * See docs/visual-design.md, "The domain marks, which answer the question the palette could not".
 * The catalog has classified every tool by `domain` since it was written and nothing ever showed
 * that classification; this is the showing, and it is the domain marker the elevation section
 * speculated about — delivered as a **glyph rather than a colour**, so the eight unused palette
 * entries stay unused. A colour-coded domain would have collided with the genre skins, which own a
 * panel's hue, and with the tone colours, which own meaning. A glyph collides with neither.
 *
 * **All five from `set2`**, the pack's fantasy sheet, so the family reads as one hand rather than
 * as five icons that happened to be available.
 *
 * **Written out rather than built from `DOMAINS`**, for the reason `TOOL_PANELS` is: a computed
 * import specifier cannot be statically analysed, so a lookup that resolved `set2/${domain}.svg`
 * would bundle all 455 icons into any page that showed one. `toolMarksCoverDomains` is what keeps
 * the hand-written map honest instead.
 */
export const DOMAIN_MARKS: Readonly<Record<ToolDomain, string>> = {
  /** A helm: a person *in a game*, rather than a person. */
  characters: helmet,
  /** The thing a faction plants. */
  factions: flag,
  /** Settlements, regions and dungeons all read off one. */
  locations: map,
  /** What the objects are generated into. */
  objects: chest,
  /** Instruments rather than output — dice, names, languages. */
  utilities: compass,
};

/**
 * Whether every domain has a mark and no mark outlives its domain.
 *
 * The map is hand-written because it has to be, so this is what a test holds it to — the same shape
 * as the check that keeps the tool catalog and `TOOL_PANELS` in step in both directions.
 */
export function toolMarksCoverDomains(): boolean {
  const marked = Object.keys(DOMAIN_MARKS).sort();
  return (
    marked.length === DOMAINS.length &&
    marked.every((domain, index) => domain === [...DOMAINS].sort()[index])
  );
}
