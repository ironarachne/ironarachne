"use strict";

import * as Invented from "./invented.js";

export function generate() {
  let patterns = ["cvpv", "vccvc", "gvcvc", "cvDAR", "cvcDRING", "cApERI", "cvcAcI", "cApERv", "cvs'gARvc"];

  return Invented.generate(patterns);
}
