import type { Charge } from "../../charge-types.js";
import cockatriceSVG from "./cockatrice.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const cockatrice: Charge = {
  name: "cockatrice",
  pluralName: "cockatrices",
  SVG: cockatriceSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "cockatrice", "mythical"],
};
