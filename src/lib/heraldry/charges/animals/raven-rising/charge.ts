import type { Charge } from "../../charge-types.js";
import ravenRisingSVG from "./raven-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const ravenRising: Charge = {
  name: "raven rising",
  pluralName: "ravens rising",
  SVG: ravenRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "raven", "animals"],
};
