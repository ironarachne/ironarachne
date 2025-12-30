import type { Charge } from "../../charge-types.js";
import ravenVolantSVG from "./raven-volant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const ravenVolant: Charge = {
  name: "raven volant",
  pluralName: "ravens volant",
  SVG: ravenVolantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["volant", "raven", "animals"],
};
