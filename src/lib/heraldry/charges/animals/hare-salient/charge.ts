import type { Charge } from "../../charge-types.js";
import hareSalientSVG from "./hare-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const hareSalient: Charge = {
  name: "hare salient",
  pluralName: "hares salient",
  SVG: hareSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["hare", "salient", "animals"],
};
