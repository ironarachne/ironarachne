import type { Charge } from "../../charge-types.js";
import oxSalientSVG from "./ox-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const oxSalient: Charge = {
  name: "ox salient",
  pluralName: "oxes salient",
  SVG: oxSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["ox", "salient", "animals"],
};
