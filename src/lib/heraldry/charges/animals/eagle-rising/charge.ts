import type { Charge } from "../../charge-types.js";
import eagleRisingSVG from "./eagle-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const eagleRising: Charge = {
  name: "eagle rising",
  pluralName: "eagles rising",
  SVG: eagleRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "eagle", "animals"],
};
