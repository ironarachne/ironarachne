import type { Charge } from "../../charge-types.js";
import housecatPassantSVG from "./housecat-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const housecatPassant: Charge = {
  name: "housecat passant",
  pluralName: "housecats passant",
  SVG: housecatPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["housecat", "passant", "animals"],
};
