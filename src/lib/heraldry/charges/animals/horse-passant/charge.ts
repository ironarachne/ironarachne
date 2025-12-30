import type { Charge } from "../../charge-types.js";
import horsePassantSVG from "./horse-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const horsePassant: Charge = {
  name: "horse passant",
  pluralName: "horses passant",
  SVG: horsePassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["passant", "horse", "animals"],
};
