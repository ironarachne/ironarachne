import type { Charge } from "../../charge-types.js";
import lionPassantSVG from "./lion-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const lionPassant: Charge = {
  name: "lion passant",
  pluralName: "lions passant",
  SVG: lionPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "lion", "courage"],
};
