import type { Charge } from "../../charge-types.js";
import goatPassantSVG from "./goat-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const goatPassant: Charge = {
  name: "goat passant",
  pluralName: "goats passant",
  SVG: goatPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["passant", "goat", "animals"],
};
