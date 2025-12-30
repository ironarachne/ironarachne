import type { Charge } from "../../charge-types.js";
import allocamelusRegardantSVG from "./allocamelus-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const allocamelusRegardant: Charge = {
  name: "allocamelus regardant",
  pluralName: "allocameluses regardant",
  SVG: allocamelusRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "regardant", "allocamelus"],
};
