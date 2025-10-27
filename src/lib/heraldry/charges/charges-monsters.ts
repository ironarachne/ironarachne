import type { Charge } from "./charge-types.js";
import { cockatrice } from "./monsters/cockatrice/charge.js";
import { dragonRampant } from "./monsters/dragon-rampant/charge.js";
import { gryphonSegreant } from "./monsters/gryphon-segreant/charge.js";
import { pegasusPassant } from "./monsters/pegasus-passant/charge.js";
import { pegasusRampant } from "./monsters/pegasus-rampant/charge.js";
import { unicornStatant } from "./monsters/unicorn-statant/charge.js";
import { wyvern } from "./monsters/wyvern/charge.js";

export const monsterCharges: Charge[] = [
  cockatrice,
  dragonRampant,
  gryphonSegreant,
  pegasusPassant,
  pegasusRampant,
  unicornStatant,
  wyvern,
];
