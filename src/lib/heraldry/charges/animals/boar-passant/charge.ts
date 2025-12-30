import type { Charge } from "../../charge-types.js";
import boarPassantSVG from "./boar-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarPassant: Charge = {
  name: "boar passant",
  pluralName: "boars passant",
  SVG: boarPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["boar", "passant", "animals"],
};
