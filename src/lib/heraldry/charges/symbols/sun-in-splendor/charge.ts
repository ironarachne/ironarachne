import type { Charge } from "../../charge-types.js";
import sunInSplendorSVG from "./sun-in-splendor.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const sunInSplendor: Charge = {
  name: "sun in splendor",
  pluralName: "suns in splendor",
  SVG: sunInSplendorSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["splendor", "in", "sun", "symbols"],
};
