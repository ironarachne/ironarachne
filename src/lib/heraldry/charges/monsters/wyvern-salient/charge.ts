import type { Charge } from "../../charge-types.js";
import wyvernSalientSVG from "./wyvern-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvernSalient: Charge = {
  name: "wyvern salient",
  pluralName: "wyverns salient",
  SVG: wyvernSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "wyvern", "salient"],
};
