import type { Charge } from "../../charge-types.js";
import wyvernStatantSVG from "./wyvern-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvernStatant: Charge = {
  name: "wyvern statant",
  pluralName: "wyverns statant",
  SVG: wyvernStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "wyvern", "statant"],
};
