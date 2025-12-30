import type { Charge } from "../../charge-types.js";
import ramStatantSVG from "./ram-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const ramStatant: Charge = {
  name: "ram statant",
  pluralName: "rams statant",
  SVG: ramStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["ram", "statant", "animals"],
};
