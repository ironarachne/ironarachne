import type { Charge } from "../../charge-types.js";
import foxRampantSVG from "./fox-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const foxRampant: Charge = {
  name: "fox rampant",
  pluralName: "foxes rampant",
  SVG: foxRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rampant", "fox", "animals"],
};
