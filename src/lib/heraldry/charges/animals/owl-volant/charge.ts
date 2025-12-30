import type { Charge } from "../../charge-types.js";
import owlVolantSVG from "./owl-volant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const owlVolant: Charge = {
  name: "owl volant",
  pluralName: "owls volant",
  SVG: owlVolantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["volant", "owl", "animals"],
};
