import type { Charge } from "../../charge-types.js";
import lionStatantSVG from "./lion-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const lionStatant: Charge = {
  name: "lion statant",
  pluralName: "lions statant",
  SVG: lionStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["lion", "statant", "animals"],
};
