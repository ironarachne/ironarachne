import type { Charge } from "../../charge-types.js";
import ramRampantSVG from "./ram-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const ramRampant: Charge = {
  name: "ram rampant",
  pluralName: "rams rampant",
  SVG: ramRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "ram", "strength"],
};
