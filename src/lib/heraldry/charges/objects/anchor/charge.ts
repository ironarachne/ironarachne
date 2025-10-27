import type { Charge } from "../../charge-types.js";
import anchorSVG from "./anchor.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const anchor: Charge = {
  name: "anchor",
  pluralName: "anchors",
  SVG: anchorSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["anchor", "ocean", "sea", "navy", "ship", "sailor", "coast", "trade"],
};
