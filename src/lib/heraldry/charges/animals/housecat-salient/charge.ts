import type { Charge } from "../../charge-types.js";
import housecatSalientSVG from "./housecat-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const housecatSalient: Charge = {
  name: "housecat salient",
  pluralName: "housecats salient",
  SVG: housecatSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["housecat", "salient", "animals"],
};
