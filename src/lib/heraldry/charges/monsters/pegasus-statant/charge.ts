import type { Charge } from "../../charge-types.js";
import pegasusStatantSVG from "./pegasus-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const pegasusStatant: Charge = {
  name: "pegasus statant",
  pluralName: "pegasuses statant",
  SVG: pegasusStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "pegasus", "statant"],
};
