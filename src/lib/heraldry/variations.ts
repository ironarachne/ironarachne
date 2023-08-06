"use strict";

import Variation from "./variation.js";

export function all() {
  return [
    new Variation(
      "plain",
      1,
      "tincture1",
      `<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture1"/></pattern>`,
      true,
      100,
    ),
    new Variation(
      "barry",
      2,
      "barry tincture1 and tincture2",
      `<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="110" fill="tincture1"/><rect x="0" y="110" width="600" height="110" fill="tincture2"/><rect x="0" y="220" width="600" height="110" fill="tincture1"/><rect x="0" y="330" width="600" height="110" fill="tincture2"/><rect x="0" y="440" width="600" height="110" fill="tincture1"/><rect x="0" y="550" width="600" height="110" fill="tincture2"/><rect x="0" y="660" width="600" height="110" fill="tincture1"/></pattern>`,
      false,
      5,
    ),
    new Variation(
      "bendy",
      2,
      "bendy tincture1 and tincture2",
      `<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture2"/><polygon points="0,0 600,660 700,660 100,0" fill="tincture1"/><polygon points="200,0 800,660 900,660 300,0" fill="tincture1"/><polygon points="400,0 1000,660 1100,660 500,0" fill="tincture1"/><polygon points="-200,0 400,660 500,660 -100,0" fill="tincture1"/><polygon points="-400,0 200,660 300,660 -300,0" fill="tincture1"/></pattern>`,
      false,
      5,
    ),
    new Variation(
      "bendy sinister",
      2,
      "bendy sinister tincture1 and tincture2",
      `<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture2"/><polygon points="700,0 800,0 300,660 200,660" fill="tincture1"/><polygon points="500,0 600,0 100,660 0,660" fill="tincture1"/><polygon points="300,0 400,0 -100,660 -200,660" fill="tincture1"/><polygon points="100,0 200,0 -300,660 -400,660" fill="tincture1"/></pattern>`,
      false,
      5,
    ),
    new Variation(
      "paly",
      2,
      "paly tincture1 and tincture2",
      `<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="660" fill="tincture1"/><rect x="100" y="0" width="100" height="660" fill="tincture2"/><rect x="200" y="0" width="100" height="660" fill="tincture1"/><rect x="300" y="0" width="100" height="660" fill="tincture2"/><rect x="400" y="0" width="100" height="660" fill="tincture1"/><rect x="500" y="0" width="100" height="660" fill="tincture2"/></pattern>`,
      false,
      5,
    ),
    new Variation(
      "chequy",
      2,
      "chequy tincture1 and tincture2",
      `<pattern id="variation" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="40" height="40" fill="tincture1"/><rect x="40" y="0" width="40" height="40" fill="tincture2"/><rect x="0" y="40" width="40" height="40" fill="tincture2"/><rect x="40" y="40" width="40" height="40" fill="tincture1"/></pattern>`,
      false,
      5,
    ),
  ];
}

export function byName(name: string): Variation {
  const variations = all();

  for (let i = 0; i < variations.length; i++) {
    if (variations[i].name == name) {
      return variations[i];
    }
  }

  throw new Error(`no variation with name ${name}`);
}

export function isIncludedIn(needle: Variation, haystack: Variation[]): Boolean {
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i].name == needle.name) {
      return true;
    }
  }

  return false;
}

export function removeFromSet(variation: Variation, variations: Variation[]): Variation[] {
  let result = [];

  for (let i = 0; i < variations.length; i++) {
    if (variations[i].name != variation.name) {
      result.push(variations[i]);
    }
  }

  return result;
}
