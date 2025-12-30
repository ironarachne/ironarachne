import type { Charge } from "../../charge-types.js";
import wyvernRegardantSVG from "./wyvern-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvernRegardant: Charge = {
  name: "wyvern regardant",
  pluralName: "wyverns regardant",
  SVG: wyvernRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "wyvern", "regardant"],
};
