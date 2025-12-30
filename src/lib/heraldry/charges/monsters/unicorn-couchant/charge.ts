import type { Charge } from "../../charge-types.js";
import unicornCouchantSVG from "./unicorn-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const unicornCouchant: Charge = {
  name: "unicorn couchant",
  pluralName: "unicorns couchant",
  SVG: unicornCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "couchant", "unicorn"],
};
