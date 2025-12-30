import type { Charge } from "../../charge-types.js";
import leopardRegardantSVG from "./leopard-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const leopardRegardant: Charge = {
  name: "leopard regardant",
  pluralName: "leopards regardant",
  SVG: leopardRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "leopard", "animals"],
};
