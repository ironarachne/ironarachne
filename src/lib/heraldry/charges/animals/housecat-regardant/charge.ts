import type { Charge } from "../../charge-types.js";
import housecatRegardantSVG from "./housecat-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const housecatRegardant: Charge = {
  name: "housecat regardant",
  pluralName: "housecats regardant",
  SVG: housecatRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["housecat", "regardant", "animals"],
};
