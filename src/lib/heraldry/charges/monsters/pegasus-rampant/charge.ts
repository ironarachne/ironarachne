import type { Charge } from "../../charge-types.js";
import pegasusRampantSVG from "./pegasus-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const pegasusRampant: Charge = {
  name: "pegasus rampant",
  pluralName: "pegasi rampant",
  SVG: pegasusRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "pegasus", "mythical"],
};
