import type { Charge } from "../../charge-types.js";
import hareStatantSVG from "./hare-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const hareStatant: Charge = {
  name: "hare statant",
  pluralName: "hares statant",
  SVG: hareStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["hare", "statant", "animals"],
};
