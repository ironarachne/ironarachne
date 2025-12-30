import type { Charge } from "../../charge-types.js";
import owlRisingSVG from "./owl-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const owlRising: Charge = {
  name: "owl rising",
  pluralName: "owls rising",
  SVG: owlRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "owl", "animals"],
};
