import type { Charge } from "../../charge-types.js";
import horseSalientSVG from "./horse-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const horseSalient: Charge = {
  name: "horse salient",
  pluralName: "horses salient",
  SVG: horseSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["horse", "salient", "animals"],
};
