import type { Charge } from "../../charge-types.js";
import batRisingSVG from "./bat-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const batRising: Charge = {
  name: "bat rising",
  pluralName: "bats rising",
  SVG: batRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "bat", "animals"],
};
