import type { Charge } from "../../charge-types.js";
import wyvernRampantSVG from "./wyvern-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvernRampant: Charge = {
  name: "wyvern rampant",
  pluralName: "wyverns rampant",
  SVG: wyvernRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "wyvern", "rampant"],
};
