"use strict";

import StarClassification from "./classification.js";

export function all() {
  return [
    new StarClassification("main sequence", 0.1, 0.5, 0.1, 0.5, 2000, 4000, 0.01, 0.05, 40),
    new StarClassification("main sequence", 0.6, 0.9, 0.6, 0.8, 4000, 5000, 0.1, 0.8, 45),
    new StarClassification("main sequence", 0.9, 1.1, 0.8, 1.3, 5000, 6000, 0.8, 3.0, 60),
    new StarClassification("main sequence", 1.1, 1.5, 1.3, 1.8, 6000, 8000, 3.0, 8.0, 30),
    new StarClassification("main sequence", 1.5, 4.0, 1.8, 5.0, 8000, 15000, 15.0, 25.0, 10),
    new StarClassification("main sequence", 4.0, 6.0, 8.0, 12.0, 15000, 25000, 900.0, 1100.0, 5),
    new StarClassification(
      "main sequence",
      8.0,
      12.0,
      45.0,
      55.0,
      35000,
      45000,
      90000.0,
      110000.0,
      1,
    ),
    new StarClassification("giant", 10.0, 50.0, 1.0, 5.0, 3000, 10000, 50.0, 1000.0, 2),
    new StarClassification(
      "supergiant",
      30.0,
      500.0,
      10.0,
      70.0,
      4000,
      40000,
      30000.0,
      1000000.0,
      1,
    ),
  ];
}
