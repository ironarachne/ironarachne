import type { Charge } from "../../charge-types.js";
import leopardCouchantSVG from "./leopard-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const leopardCouchant: Charge = {
  name: "leopard couchant",
  pluralName: "leopards couchant",
  SVG: leopardCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "leopard", "animals"],
};
