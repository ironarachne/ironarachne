import type { Charge } from "../../charge-types.js";
import owlSVG from "./owl.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const owl: Charge = {
  name: "owl",
  pluralName: "owls",
  SVG: owlSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["bird", "owl", "wisdom"],
};
