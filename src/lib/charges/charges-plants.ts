import type { ChargeGlyph } from './charge-types.js';
import { acornSlippedAndLeaved } from './plants/acorn-slipped-and-leaved/charge.js';
import { fleurDeLis } from './plants/fleur-de-lis/charge.js';
import { mint } from './plants/mint/charge.js';
import { rose } from './plants/rose/charge.js';
import { roseSlippedAndLeaved } from './plants/rose-slipped-and-leaved/charge.js';
import { tarragon } from './plants/tarragon/charge.js';
import { thistle } from './plants/thistle/charge.js';
import { treeEradicated } from './plants/tree-eradicated/charge.js';

export const plantCharges: ChargeGlyph[] = [
  acornSlippedAndLeaved,
  fleurDeLis,
  mint,
  rose,
  roseSlippedAndLeaved,
  tarragon,
  thistle,
  treeEradicated,
];
