import type { Charge } from "../../charge-types.js";
import roseSlippedAndLeavedSVG from "./rose-slipped-and-leaved.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const roseSlippedAndLeaved: Charge = {
  name: "rose slipped and leaved",
  pluralName: "roses slipped and leaved",
  SVG: roseSlippedAndLeavedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["and", "rose", "leaved", "slipped", "plants"],
};
