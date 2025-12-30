import type { Charge } from "../../charge-types.js";
import acornSlippedAndLeavedSVG from "./acorn-slipped-and-leaved.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const acornSlippedAndLeaved: Charge = {
  name: "acorn slipped and leaved",
  pluralName: "acorns slipped and leaved",
  SVG: acornSlippedAndLeavedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["and", "leaved", "slipped", "plants", "acorn"],
};
