import type { Charge } from "../../charge-types.js";
import salamanderSVG from "./salamander.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const salamander: Charge = {
  name: "salamander",
  pluralName: "salamanders",
  SVG: salamanderSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "salamander"],
};
