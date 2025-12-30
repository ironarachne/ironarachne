import type { Charge } from "../../charge-types.js";
import owlDisplayedSVG from "./owl-displayed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const owlDisplayed: Charge = {
  name: "owl displayed",
  pluralName: "owls displayed",
  SVG: owlDisplayedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["owl", "displayed", "animals"],
};
