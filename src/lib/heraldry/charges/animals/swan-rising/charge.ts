import type { Charge } from "../../charge-types.js";
import swanRisingSVG from "./swan-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const swanRising: Charge = {
  name: "swan rising",
  pluralName: "swans rising",
  SVG: swanRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "swan", "animals"],
};
