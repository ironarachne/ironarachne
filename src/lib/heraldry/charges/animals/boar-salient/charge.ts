import type { Charge } from "../../charge-types.js";
import boarSalientSVG from "./boar-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarSalient: Charge = {
  name: "boar salient",
  pluralName: "boars salient",
  SVG: boarSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["boar", "salient", "animals"],
};
