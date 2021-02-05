import * as iarnd from "../random.js";

export function all() {
  return [
    {
      name: "plain",
      tinctureCount: 1,
      blazon: "tincture1",
      pattern:
        '<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture1"/></pattern>',
      weight: 100,
    },
    {
      name: "barry",
      tinctureCount: 2,
      blazon: "barry tincture1 and tincture2",
      pattern:
        '<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="110" fill="tincture1"/><rect x="0" y="110" width="600" height="110" fill="tincture2"/><rect x="0" y="220" width="600" height="110" fill="tincture1"/><rect x="0" y="330" width="600" height="110" fill="tincture2"/><rect x="0" y="440" width="600" height="110" fill="tincture1"/><rect x="0" y="550" width="600" height="110" fill="tincture2"/><rect x="0" y="660" width="600" height="110" fill="tincture1"/></pattern>',
      weight: 5,
    },
    {
      name: "bendy",
      tinctureCount: 2,
      blazon: "bendy tincture1 and tincture2",
      pattern:
        '<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture2"/><polygon points="0,0 600,660 700,660 100,0" fill="tincture1"/><polygon points="200,0 800,660 900,660 300,0" fill="tincture1"/><polygon points="400,0 1000,660 1100,660 500,0" fill="tincture1"/><polygon points="-200,0 400,660 500,660 -100,0" fill="tincture1"/><polygon points="-400,0 200,660 300,660 -300,0" fill="tincture1"/></pattern>',
      weight: 5,
    },
    {
      name: "bendy sinister",
      tinctureCount: 2,
      blazon: "bendy sinister tincture1 and tincture2",
      pattern:
        '<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="600" height="660" fill="tincture2"/><polygon points="700,0 800,0 300,660 200,660" fill="tincture1"/><polygon points="500,0 600,0 100,660 0,660" fill="tincture1"/><polygon points="300,0 400,0 -100,660 -200,660" fill="tincture1"/><polygon points="100,0 200,0 -300,660 -400,660" fill="tincture1"/></pattern>',
      weight: 5,
    },
    {
      name: "paly",
      tinctureCount: 2,
      blazon: "paly tincture1 and tincture2",
      pattern:
        '<pattern id="variation" x="0" y="0" width="600" height="660" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="100" height="660" fill="tincture1"/><rect x="100" y="0" width="100" height="660" fill="tincture2"/><rect x="200" y="0" width="100" height="660" fill="tincture1"/><rect x="300" y="0" width="100" height="660" fill="tincture2"/><rect x="400" y="0" width="100" height="660" fill="tincture1"/><rect x="500" y="0" width="100" height="660" fill="tincture2"/></pattern>',
      weight: 5,
    },
    {
      name: "chequy",
      tinctureCount: 2,
      blazon: "chequy tincture1 and tincture2",
      pattern:
        '<pattern id="variation" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="40" height="40" fill="tincture1"/><rect x="40" y="0" width="40" height="40" fill="tincture2"/><rect x="0" y="40" width="40" height="40" fill="tincture2"/><rect x="40" y="40" width="40" height="40" fill="tincture1"/></pattern>',
      weight: 5,
    },
  ];
}

export function random() {
  let options = all();
  let result = iarnd.item(options);
  return result;
}

export function randomWeighted() {
  let variations = all();
  let weights = [];

  for (let i = 0; i < variations.length; i++) {
    weights.push({
      item: variations[i].name,
      weight: variations[i].weight,
    });
  }

  let resultName = iarnd.weighted(weights);
  let result = {};

  for (let i = 0; i < variations.length; i++) {
    if (variations[i].name == resultName.item) {
      result = variations[i];
      break;
    }
  }

  return result;
}

export function renderBlazon(variation) {
  let blazon = variation.blazon;

  blazon = blazon.replace("tincture1", variation.tinctures[0].name);

  if (variation.tinctures.length > 1) {
    blazon = blazon.replace("tincture2", variation.tinctures[1].name);
  }

  return blazon;
}

export function renderSVGPattern(variation) {
  let svg = variation.pattern;

  svg = svg.replaceAll(
    "tincture1",
    "url(#" + variation.tinctures[0].name + ")"
  );

  if (variation.tinctureCount > 1) {
    svg = svg.replaceAll(
      "tincture2",
      "url(#" + variation.tinctures[1].name + ")"
    );
  }

  return svg;
}
