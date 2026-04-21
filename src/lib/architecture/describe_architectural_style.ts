import * as Words from '@ironarachne/words';
import type { ArchitecturalStyle } from './architectural_style_types';
import { fragmentsForArchitecturalStyle } from './description_fragments';

/**
 * Builds a general prose description of a generated architectural style.
 */
export function describeArchitecturalStyle(style: ArchitecturalStyle): string {
  const raw = fragmentsForArchitecturalStyle(style).join(' ');
  return Words.fixPunctuation(raw);
}
