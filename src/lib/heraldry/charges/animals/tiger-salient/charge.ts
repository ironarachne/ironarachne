import type { Charge } from "../../charge-types.js";
import tigerSalientSVG from "./tiger-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const tigerSalient: Charge = {
  name: "tiger salient",
  pluralName: "tigers salient",
  SVG: tigerSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["tiger", "salient", "animals"],
};
