import type { Charge } from "../../charge-types.js";
import heronDisplayedSVG from "./heron-displayed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const heronDisplayed: Charge = {
  name: "heron displayed",
  pluralName: "herons displayed",
  SVG: heronDisplayedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["heron", "displayed", "animals"],
};
