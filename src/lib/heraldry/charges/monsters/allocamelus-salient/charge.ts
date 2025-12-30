import type { Charge } from "../../charge-types.js";
import allocamelusSalientSVG from "./allocamelus-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const allocamelusSalient: Charge = {
  name: "allocamelus salient",
  pluralName: "allocameluses salient",
  SVG: allocamelusSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "allocamelus", "salient"],
};
