import type { Charge } from "../../charge-types.js";
import batVolantSVG from "./bat-volant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const batVolant: Charge = {
  name: "bat volant",
  pluralName: "bats volant",
  SVG: batVolantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "bat", "night"],
};
