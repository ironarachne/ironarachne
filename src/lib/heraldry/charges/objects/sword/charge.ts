import type { Charge } from "../../charge-types.js";
import swordSVG from "./sword.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const sword: Charge = {
  name: "sword",
  pluralName: "swords",
  SVG: swordSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["sword", "objects"],
};
