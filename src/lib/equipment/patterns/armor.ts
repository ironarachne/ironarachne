"use strict";

import BreastplatePattern from "./armor/breastplate.js";
import ChainmailPattern from "./armor/chainmail.js";
import HelmetPattern from "./armor/helmet.js";
import LeatherArmorPattern from "./armor/leather.js";
import PrimitiveShieldPattern from "./armor/primitiveshield.js";
import ShieldPattern from "./armor/shield.js";
import type Pattern from "./pattern.js";

export function all(): Pattern[] {
  return [
    new BreastplatePattern("breastplate", 40000),
    new BreastplatePattern("corrugated breastplate", 45000),
    new BreastplatePattern("cuirass", 40000),
    new BreastplatePattern("Gothic cuirass", 50000),
    new BreastplatePattern("plate cuirass", 40000),
    new BreastplatePattern("skirted breastplate", 45000),
    new ChainmailPattern("chain hauberk", 5500),
    new ChainmailPattern("chain shirt", 4500),
    new ChainmailPattern("chain vest", 4500),
    new HelmetPattern("armet", 500),
    new HelmetPattern("bascinet", 1000),
    new HelmetPattern("great helm", 500),
    new HelmetPattern("kettle helm", 500),
    new HelmetPattern("nasal helm", 500),
    new HelmetPattern("pot helm", 500),
    new HelmetPattern("spangenhelm", 500),
    new LeatherArmorPattern("brigandine", 1000),
    new LeatherArmorPattern("cuirass", 1000),
    new PrimitiveShieldPattern("round shield", 1000),
    new PrimitiveShieldPattern("square shield", 1000),
    new ShieldPattern("heater shield", 1000),
    new ShieldPattern("kite shield", 1000),
    new ShieldPattern("targé shield", 1000),
  ];
}
