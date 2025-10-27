import type { Charge } from "../../charge-types.js";
import bearRampantSVG from "./bear-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bearRampant: Charge = {
  name: "bear rampant",
  pluralName: "bears rampant",
  SVG: bearRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "bear", "strength"],
};
