import type { Charge } from "../../charge-types.js";
import wyvernSVG from "./wyvern.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvern: Charge = {
  name: "wyvern",
  pluralName: "wyverns",
  SVG: wyvernSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "wyvern"],
};
