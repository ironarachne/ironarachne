import type { Charge } from "./charge-types.js";
import { anchor } from "./objects/anchor/charge.js";
import { barrel } from "./objects/barrel/charge.js";
import { battleaxe } from "./objects/battleaxe/charge.js";
import { bell } from "./objects/bell/charge.js";
import { castle } from "./objects/castle/charge.js";
import { tower } from "./objects/tower/charge.js";
import { twoAxesInSaltire } from "./objects/two-axes-in-saltire/charge.js";

export const objectCharges: Charge[] = [
  anchor,
  barrel,
  battleaxe,
  bell,
  castle,
  tower,
  twoAxesInSaltire,
];
