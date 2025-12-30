import type { Charge } from "../../charge-types.js";
import lionRegardantSVG from "./lion-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const lionRegardant: Charge = {
  name: "lion regardant",
  pluralName: "lions regardant",
  SVG: lionRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "lion", "animals"],
};
