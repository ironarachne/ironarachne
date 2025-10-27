import type { Charge } from "../../charge-types.js";
import gryphonSegreantSVG from "./gryphon-segreant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const gryphonSegreant: Charge = {
  name: "gryphon segreant",
  pluralName: "gryphons segreant",
  SVG: gryphonSegreantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "gryphon", "mythical"],
};
