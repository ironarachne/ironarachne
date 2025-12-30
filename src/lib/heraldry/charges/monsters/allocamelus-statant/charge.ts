import type { Charge } from "../../charge-types.js";
import allocamelusStatantSVG from "./allocamelus-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const allocamelusStatant: Charge = {
  name: "allocamelus statant",
  pluralName: "allocameluses statant",
  SVG: allocamelusStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "allocamelus", "statant"],
};
