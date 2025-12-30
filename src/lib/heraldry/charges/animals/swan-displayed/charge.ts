import type { Charge } from "../../charge-types.js";
import swanDisplayedSVG from "./swan-displayed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const swanDisplayed: Charge = {
  name: "swan displayed",
  pluralName: "swans displayed",
  SVG: swanDisplayedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["swan", "displayed", "animals"],
};
